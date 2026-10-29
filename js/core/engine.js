/**
 * 健康空间站 · 游戏引擎
 * 统一阶段机 / 计时 / 结算 / 存储 / 音效 / 反馈。
 * 14 个游戏只写「本游戏规则」（出题、判定、交指标），其余一致交给这里。
 */
window.HC = window.HC || {};

/* ---------- 轻量音效（WebAudio） ---------- */
const AudioKit = (function () {
  let ctxRef = null;
  function ac() {
    if (!ctxRef) {
      try { ctxRef = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctxRef = null; }
    }
    if (ctxRef && ctxRef.state === 'suspended') ctxRef.resume();
    return ctxRef;
  }
  function tone(freq, dur, type, gain) {
    const a = ac(); if (!a) return;
    const o = a.createOscillator(); const g = a.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.value = 0.0001;
    o.connect(g); g.connect(a.destination);
    const t = a.currentTime;
    g.gain.exponentialRampToValueAtTime(gain || 0.18, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.16));
    o.start(t); o.stop(t + (dur || 0.16) + 0.02);
  }
  return {
    ok() { tone(660, 0.14, 'sine', 0.16); },
    bad() { tone(180, 0.18, 'sawtooth', 0.12); },
    tick() { tone(880, 0.05, 'square', 0.08); },
    go() { tone(523, 0.12, 'sine', 0.16); },
    noGo() { tone(196, 0.22, 'sawtooth', 0.12); },
    toneFreq(freq, ms) { tone(freq, (ms || 350) / 1000, 'sine', 0.2); },
  };
})();

const FB_HOLD = { ok: 700, bad: 960 };
const FB_TEXT = {
  schulte: { ok: '对了，接着往下找', bad: '这个还不到号' },
  cancel: { ok: '划掉了', bad: '这个不是要划的' },
  match: { ok: '配上了', bad: '不是这一对' },
  trail: { ok: '连上了', bad: '顺序不对' },
  diff: { ok: '找到一处', bad: '这两处其实一样' },
  stroop: { ok: '对，看的是颜色', bad: '看字的颜色，不是意思' },
  gonogo: { ok: '反应真快', bad: '红灯亮了，不能点' },
  digit: { ok: '记住了', bad: '再看一遍' },
  search: { ok: '找到了', bad: '这里没有' },
  nback: { ok: '对了', bad: '这个和前面不一样' },
  water: { ok: '倒过去了', bad: '这杯装不下了' },
  pitch: { ok: '对了', bad: '再听一遍就分得出来' },
  track: { ok: '记住了', bad: '看错目标了' },
  space: { ok: '顺序对了', bad: '顺序不对' },
};
const CHEER = {
  excellent: ['又稳又准，注意力全程在线。', '每次都接住了，这份专注难得。', '手眼都跟得上，状态真好。'],
  steady: ['不快不慢，刚刚好。', '中间有点小波动，整体还稳。', '稳稳练完一局，比快更重要。'],
  retry: ['手有点急，心没乱。', '这一局先热身，下局更顺手。', '慢一点没关系，练的就是这口气。'],
};

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

const Engine = {
  _cleanup: null,

  play(gameId, mount, opts) {
    const meta = HC.meta.GAME_MAP[gameId];
    const settings = HC.store.getSettings();
    const gameMod = HC.games[gameId];
    if (!meta || !gameMod) { mount.innerHTML = '<p style="padding:24px">游戏不存在</p>'; return; }
    const bestByGame = (HC.stats.summarize(HC.store.readRecords()).bestByGame) || {};

    const t0 = Date.now();
    let chosenLevelId = HC.levels.defaultLevel(gameId, bestByGame);
    if (opts && opts.levelId && HC.levels.isLevel(gameId, opts.levelId)) chosenLevelId = opts.levelId;

    const root = el('div', 'game-screen');
    mount.innerHTML = '';
    mount.appendChild(root);

    const self = this;

    function showIntro() {
      if (self._cleanup) { self._cleanup(); self._cleanup = null; }
      root.innerHTML = '';
      const card = el('div', 'intro-card');
      card.appendChild(el('div', 'intro-emoji', meta.emoji || '🎮'));
      card.appendChild(el('h2', 'intro-title', meta.name));
      card.appendChild(el('p', 'intro-tag', meta.tagline));
      const dims = el('div', 'intro-dims');
      HC.meta.DIMS.forEach((d) => {
        if (meta.dims[d.key] > 0) {
          const chip = el('span', 'dim-chip', d.name);
          chip.style.borderColor = meta.color;
          chip.style.color = meta.color;
          dims.appendChild(chip);
        }
      });
      card.appendChild(dims);

      const picker = el('div', 'level-picker');
      const levels = HC.levels.listLevels(gameId);
      let picked = chosenLevelId;
      const btns = [];
      levels.forEach((lv) => {
        const b = el('button', 'level-btn' + (lv.id === picked ? ' active' : ''));
        b.innerHTML = `<span class="lv-name">${lv.name}</span><span class="lv-brief">${lv.brief}</span>`;
        b.onclick = () => {
          picked = lv.id;
          btns.forEach((x) => x.classList.remove('active'));
          b.classList.add('active');
        };
        btns.push(b);
        picker.appendChild(b);
      });
      card.appendChild(el('div', 'picker-label', '选择难度'));
      card.appendChild(picker);

      const startBtn = el('button', 'btn-primary big', '开始训练');
      startBtn.onclick = () => { chosenLevelId = picked; runLevel(); };
      card.appendChild(startBtn);

      const back = el('button', 'btn-ghost small', '← 返回大厅');
      back.onclick = () => { if (opts && opts.onExit) opts.onExit(); };
      card.appendChild(back);

      root.appendChild(card);
    }

    function runLevel() {
      if (self._cleanup) { self._cleanup(); self._cleanup = null; }
      root.innerHTML = '';
      const level = HC.levels.getLevel(gameId, chosenLevelId);
      const top = el('div', 'game-top');
      const nameTag = el('div', 'game-name-tag', `${meta.name} · ${HC.meta.LEVEL_NAMES[chosenLevelId]}`);
      const exitBtn = el('button', 'game-exit', '✕');
      exitBtn.onclick = () => { if (opts && opts.onExit) opts.onExit(); };
      top.appendChild(nameTag); top.appendChild(exitBtn);
      root.appendChild(top);

      const playArea = el('div', 'game-area');
      root.appendChild(playArea);

      const fb = el('div', 'game-fb');
      root.appendChild(fb);

      const ctx = {
        level,
        audio: AudioKit,
        soundOn: settings.sound !== false,
        floating(text, type) {
          fb.textContent = text;
          fb.className = 'game-fb show ' + (type || 'ok');
          clearTimeout(fb._t);
          fb._t = setTimeout(() => { fb.className = 'game-fb'; }, FB_HOLD[type] || 700);
        },
        fbOk() { const t = FB_TEXT[gameId] && FB_TEXT[gameId].ok; if (t) this.floating(t, 'ok'); if (this.soundOn) AudioKit.ok(); },
        fbBad() { const t = FB_TEXT[gameId] && FB_TEXT[gameId].bad; if (t) this.floating(t, 'bad'); if (this.soundOn) AudioKit.bad(); },
        finish(metrics) {
          metrics = metrics || {};
          if (!metrics.durationMs) metrics.durationMs = Date.now() - t0;
          self.finishGame(gameId, chosenLevelId, metrics, root, { onReplay: runLevel, onExit: opts && opts.onExit });
        },
      };
      const cleanup = gameMod.run(playArea, level, ctx);
      if (typeof cleanup === 'function') self._cleanup = cleanup;
    }

    showIntro();
  },

  finishGame(gameId, levelId, metrics, root, cb) {
    if (this._cleanup) { this._cleanup(); this._cleanup = null; }
    const lv = HC.levels.getLevel(gameId, levelId);
    const sc = HC.score.scoreOf(gameId, metrics, lv);
    const rating = HC.score.ratingOf(sc.score);
    const record = {
      _id: HC.store.uid(),
      gameId, levelId,
      score: sc.score,
      accuracy: sc.accuracy,
      durationMs: metrics.durationMs || 0,
      avgRt: metrics.avgRt || 0,
      rtSd: isFinite(metrics.rtSd) ? metrics.rtSd : null,
      createdAt: Date.now(),
      endedAt: Date.now(),
      dayKey: HC.stats.dayKeyOf(Date.now()),
    };
    HC.store.appendRecord(record);
    HC.store.setLast(gameId, levelId);
    const streak = HC.store.bumpStreak(gameId, rating === 'excellent' ? 'excellent' : (rating === 'retry' ? 'retry' : 'steady'));
    const adv = HC.levels.advance(levelId, streak);

    root.innerHTML = '';
    const overlay = el('div', 'result-overlay');
    const card = el('div', 'result-card');
    const ring = el('div', 'result-ring ' + rating);
    ring.innerHTML = `<span class="rs-score">${sc.score}</span><span class="rs-label">分</span>`;
    const ratingText = { excellent: '很棒', steady: '稳稳的', retry: '下次会更好' }[rating];
    card.appendChild(ring);
    card.appendChild(el('div', 'result-rating', ratingText));
    const cheerIdx = Math.floor((record.createdAt / 1000) % 3);
    card.appendChild(el('p', 'result-cheer', (CHEER[rating] || CHEER.steady)[cheerIdx]));

    const grid = el('div', 'result-meta');
    grid.appendChild(el('div', 'rm-item', `<span class="rm-k">用时</span><span class="rm-v">${Math.round((record.durationMs || 0) / 1000)}s</span>`));
    grid.appendChild(el('div', 'rm-item', `<span class="rm-k">正确率</span><span class="rm-v">${Math.round((sc.accuracy || 0) * 100)}%</span>`));
    grid.appendChild(el('div', 'rm-item', `<span class="rm-k">难度</span><span class="rm-v">${HC.meta.LEVEL_NAMES[levelId]}</span>`));
    card.appendChild(grid);

    if (adv.changed === 'up') card.appendChild(el('p', 'result-up', '连续两次很棒，下次自动从「中等」开始～'));
    if (adv.changed === 'down') card.appendChild(el('p', 'result-up', '先降一档，把基础打牢再来。'));

    const actions = el('div', 'result-actions');
    const replay = el('button', 'btn-primary', '再玩一次');
    replay.onclick = () => { if (cb && cb.onReplay) cb.onReplay(); };
    const back = el('button', 'btn-ghost', '返回大厅');
    back.onclick = () => { if (cb && cb.onExit) cb.onExit(); };
    actions.appendChild(replay); actions.appendChild(back);
    card.appendChild(actions);

    overlay.appendChild(card);
    root.appendChild(overlay);
  },
};

HC.engine = Engine;
HC.audio = AudioKit;

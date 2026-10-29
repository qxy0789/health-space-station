/**
 * 健康空间站 · 应用外壳（路由 + 四大页）
 */
(function () {
  const GAMES = HC.meta.GAMES, GAME_MAP = HC.meta.GAME_MAP, DIMS = HC.meta.DIMS;
  const view = document.getElementById('view');
  const tabbar = document.getElementById('tabbar');
  const topbar = document.getElementById('topbar');

  function go(hash) { location.hash = hash; }
  function current() { return location.hash.replace(/^#/, '') || '/hall'; }

  function setTop(title, sub) {
    topbar.innerHTML = `<div class="top-title">${title}</div>` + (sub ? `<div class="top-sub">${sub}</div>` : '');
  }
  function showTabbar(show) { tabbar.style.display = show ? 'flex' : 'none'; }

  /* ---------- 雷达图（内联 SVG） ---------- */
  function radarSVG(radar, size) {
    const s = size || 220, cx = s / 2, cy = s / 2, R = s / 2 - 28;
    const n = radar.length;
    const ang = (i) => -Math.PI / 2 + i * (2 * Math.PI / n);
    const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
    let grid = '';
    [0.25, 0.5, 0.75, 1].forEach((f) => {
      const p = radar.map((_, i) => pt(i, R * f).join(',')).join(' ');
      grid += `<polygon points="${p}" fill="none" stroke="#3a4a66" stroke-width="1"/>`;
    });
    let axes = '', labels = '';
    radar.forEach((d, i) => {
      const [x, y] = pt(i, R);
      axes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#3a4a66" stroke-width="1"/>`;
      const [lx, ly] = pt(i, R + 16);
      labels += `<text x="${lx}" y="${ly}" fill="#cdd6f4" font-size="11" text-anchor="middle" dominant-baseline="middle">${d.name}</text>`;
      if (d.hasData) labels += `<text x="${lx}" y="${ly + 12}" fill="${d.value >= 70 ? '#7ee0a0' : (d.value >= 50 ? '#f5c451' : '#ff8a8a')}" font-size="10" text-anchor="middle">${d.value}</text>`;
    });
    const dataPts = radar.map((d, i) => pt(i, R * (d.hasData ? d.value / 100 : 0)).join(',')).join(' ');
    const poly = `<polygon points="${dataPts}" fill="rgba(124,187,255,0.35)" stroke="#7CBBFF" stroke-width="2"/>`;
    const dots = radar.map((d, i) => d.hasData ? `<circle cx="${pt(i, R * d.value / 100)[0]}" cy="${pt(i, R * d.value / 100)[1]}" r="3" fill="#7CBBFF"/>` : '').join('');
    return `<svg viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">${grid}${axes}${poly}${dots}${labels}</svg>`;
  }

  /* ---------- 大厅 ---------- */
  function renderHall() {
    setTop('健康空间站', '脑力专注训练站');
    showTabbar(true);
    const recs = HC.store.readRecords();
    const sum = HC.stats.summarize(recs);
    const last = HC.store.getLast();
    const ringPct = sum.today.pct;

    let html = `
      <section class="hero">
        <div class="hero-glow"></div>
        <div class="today-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#26324a" stroke-width="10"/>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#7CCBFF" stroke-width="10" stroke-linecap="round"
              stroke-dasharray="${2 * Math.PI * 52}" stroke-dashoffset="${2 * Math.PI * 52 * (1 - ringPct / 100)}" transform="rotate(-90 60 60)"/>
            <text x="60" y="55" text-anchor="middle" fill="#fff" font-size="26" font-weight="700">${sum.today.count}</text>
            <text x="60" y="76" text-anchor="middle" fill="#9aa7c7" font-size="12">/ ${sum.today.goal} 局</text>
          </svg>
        </div>
        <div class="hero-info">
          <div class="hero-line">今日小目标${sum.today.done ? '已达成 🎉' : '还差 ' + (sum.today.goal - sum.today.count) + ' 局'}</div>
          <div class="hero-stats">
            <span>🔥 连续 ${sum.streakDays} 天</span>
            <span>📚 累计 ${sum.total} 局</span>
            <span>⭐ 平均 ${sum.avgScore} 分</span>
          </div>
        </div>
      </section>`;

    if (last && GAME_MAP[last.gameId]) {
      const m = GAME_MAP[last.gameId];
      html += `<button class="last-banner" onclick="HC.app.openGame('${last.gameId}')">
        <span class="lb-emoji">${m.emoji}</span>
        <span class="lb-text">上次玩了 <b>${m.name}</b> · ${HC.meta.LEVEL_NAMES[last.levelId]}</span>
        <span class="lb-go">继续 →</span></button>`;
    }

    html += `<h3 class="sec-title">专注力训练 · 14 项</h3><div class="game-grid">`;
    GAMES.forEach((g) => {
      html += `<button class="game-card" style="--c:${g.color};--bg:${g.bg}" onclick="HC.app.openGame('${g.id}')">
        <span class="gc-emoji">${g.emoji}</span>
        <span class="gc-name">${g.name}</span>
        <span class="gc-tag">${g.tagline}</span>
      </button>`;
    });
    html += `</div>
      <p class="disclaimer">本应用为脑力训练工具，所有数据仅保存在本机，不上传云端。结果仅供娱乐与自我观察，不构成任何医学诊断或治疗建议。</p>`;
    view.innerHTML = html;
  }

  /* ---------- 训练记录 ---------- */
  function renderRecords() {
    setTop('训练记录', '每一次练习都算数');
    showTabbar(true);
    const recs = HC.store.readRecords();
    const sum = HC.stats.summarize(recs);
    let html = `<div class="rec-summary">
      <div class="rs-box"><b>${sum.total}</b><span>总场次</span></div>
      <div class="rs-box"><b>${sum.days}</b><span>坚持天数</span></div>
      <div class="rs-box"><b>${sum.streakDays}</b><span>连续天数</span></div>
      <div class="rs-box"><b>${sum.avgScore}</b><span>平均分</span></div>
    </div>`;
    if (!recs.length) {
      html += `<div class="empty">还没有记录，去大厅玩一局吧～</div>`;
    } else {
      html += `<div class="rec-list">`;
      recs.slice(0, 60).forEach((r) => {
        const m = GAME_MAP[r.gameId] || { name: r.gameId, emoji: '🎮', color: '#888' };
        const d = new Date(r.endedAt || r.createdAt);
        const dt = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        const tone = r.score >= 85 ? 'high' : (r.score >= 60 ? 'mid' : 'low');
        html += `<div class="rec-item">
          <span class="ri-emoji" style="background:${m.bg || '#eee'}">${m.emoji}</span>
          <div class="ri-main"><b>${m.name}</b> · ${HC.meta.LEVEL_NAMES[r.levelId]}<div class="ri-time">${dt}</div></div>
          <span class="ri-score ${tone}">${r.score}</span>
        </div>`;
      });
      html += `</div>
        <button class="btn-ghost danger" onclick="HC.app.clearData()">清空本机数据</button>`;
    }
    view.innerHTML = html;
  }

  /* ---------- 分析报告 ---------- */
  function renderReport() {
    setTop('分析报告', '你的专注力画像');
    showTabbar(true);
    const recs = HC.store.readRecords();
    const rep = HC.report.buildReport(recs);
    if (!rep.sampleCount) {
      view.innerHTML = `<div class="empty big">先玩几局，这里会生成你的五维专注力画像。<br>数据全部留在本机，放心练。</div>`;
      return;
    }
    let html = `<div class="report-card">
      <div class="report-head">
        <div class="grade">${rep.grade}</div>
        <div><div class="rh-score">综合 ${rep.avgScore} 分</div>
        <div class="rh-sub">已练 ${rep.coverage.playedCount}/${rep.coverage.totalGames} 个项目</div></div>
      </div>
      <div class="radar-wrap">${radarSVG(rep.radar, 240)}</div>`;
    if (rep.stability) {
      html += `<div class="stability">反应稳定性：<b>${rep.stability.value}</b> · ${rep.stability.label}</div>`;
    }
    html += `<div class="insights">`;
    rep.insights.forEach((it) => {
      const icon = { flag: '🚩', chart: '📊', lightbulb: '💡', calendar: '📅' }[it.icon] || '•';
      html += `<div class="insight"><span class="ins-ico">${icon}</span><div><b>${it.title}</b><div class="ins-text">${it.text}</div></div></div>`;
    });
    html += `</div></div>`;
    view.innerHTML = html;
  }

  /* ---------- 我的 ---------- */
  function renderMe() {
    setTop('我的', '设置与说明');
    showTabbar(true);
    const s = HC.store.getSettings();
    view.innerHTML = `
      <div class="me-card">
        <div class="me-avatar">🚀</div>
        <div class="me-name">健康空间站玩家</div>
        <div class="me-sub">本地账户 · 数据不上云</div>
      </div>
      <div class="setting-row">
        <span>🔊 音效</span>
        <button class="switch ${s.sound !== false ? 'on' : ''}" id="sw-sound" onclick="HC.app.toggleSound()"></button>
      </div>
      <div class="me-section">
        <h4>关于本应用</h4>
        <p class="me-p">「健康空间站」参考「健脑乐园专注力训练」项目复刻开发的 H5 网页版，包含 14 项专注力小训练，覆盖持续专注、工作记忆、视觉搜索、反应控制、执行速度五个维度。所有成绩与记录仅保存在你这台设备的浏览器本地存储中，不会上传任何服务器。</p>
        <p class="me-p">本应用为科普与训练辅助工具，不构成医疗诊断。如有健康疑虑请咨询专业医生。</p>
      </div>
      <button class="btn-ghost danger" onclick="HC.app.clearData()">清空本机数据</button>`;
  }

  /* ---------- 游戏 ---------- */
  function renderGame(id) {
    setTop('训练中', '');
    showTabbar(false);
    view.innerHTML = '<div id="game-mount"></div>';
    const mount = document.getElementById('game-mount');
    HC.engine.play(id, mount, { onExit: () => go('/hall') });
  }

  /* ---------- 路由 ---------- */
  function render() {
    const r = current();
    if (r.startsWith('/game/')) return renderGame(r.slice(6));
    if (r === '/records') return renderRecords();
    if (r === '/report') return renderReport();
    if (r === '/me') return renderMe();
    return renderHall();
  }

  HC.app = {
    openGame(id) { go('/game/' + id); },
    toggleSound() {
      const s = HC.store.getSettings();
      HC.store.setSettings({ sound: !(s.sound !== false) });
      const el = document.getElementById('sw-sound');
      if (el) el.classList.toggle('on');
    },
    clearData() {
      if (confirm('确定清空本机所有训练记录与设置吗？此操作不可恢复。')) {
        HC.store.clearRecords();
        HC.store.setSettings({ sound: true, haptic: true, streak: {} });
        render();
      }
    },
  };

  window.addEventListener('hashchange', render);
  if (!location.hash) location.hash = '/hall';
  render();
})();

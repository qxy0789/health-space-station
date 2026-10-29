/** 音高判断：听两个音，哪个更高（自适应难度） */
(function () {
  HC.games = HC.games || {};
  HC.games.pitch = {
    run(mount, level, ctx) {
      const base = 440;
      const rounds = level.rounds;
      let gap = level.startGap;
      let cur = 0, correct = 0, consecC = 0, consecW = 0;
      const correctGaps = [];
      let timers = [];
      let lock = false, started = false, t0 = 0;

      const playBtn = HC.el('button', 'pitch-play', '▶ 再听一次');
      const btns = HC.el('div', 'pitch-btns');
      const b1 = HC.el('button', 'pitch-btn', '第一个更高');
      const b2 = HC.el('button', 'pitch-btn', '第二个更高');
      btns.appendChild(b1); btns.appendChild(b2);
      const prog = HC.el('div', 'pitch-prog', '听好两个音…');
      mount.appendChild(playBtn); mount.appendChild(btns); mount.appendChild(prog);

      function clearTimers() { timers.forEach(clearTimeout); timers = []; }
      function freq(semis) { return base * Math.pow(2, semis / 12); }
      function play(higherFirst) {
        // 低音在前/后随机，制造难度
        const low = freq(0), high = freq(gap);
        const order = higherFirst ? [high, low] : [low, high];
        ctx.audio.toneFreq(order[0], 380);
        timers.push(setTimeout(() => ctx.audio.toneFreq(order[1], 380), 460));
        if (started === false) { started = true; t0 = Date.now(); }
      }
      function nextRound() {
        if (cur >= rounds) return finish();
        lock = false;
        const higherFirst = Math.random() < 0.5;
        prog.textContent = `第 ${cur + 1} / ${rounds} 关`;
        play(higherFirst);
        btns.dataset.higherFirst = higherFirst ? '1' : '0';
      }
      function answer(pick) {
        if (lock) return;
        lock = true;
        const higherFirst = btns.dataset.higherFirst === '1';
        const ansHigherIsFirst = higherFirst; // 第一个更高
        const ok = (pick === 'first' && ansHigherIsFirst) || (pick === 'second' && !ansHigherIsFirst);
        if (ok) {
          correct += 1; correctGaps.push(gap); ctx.fbOk();
          consecC += 1; consecW = 0;
          if (consecC >= 2) { gap = Math.max(level.minGap, gap - 1); consecC = 0; }
        } else {
          ctx.fbBad(); consecW += 1; consecC = 0;
          gap = Math.min(level.startGap, gap + 1);
        }
        cur += 1;
        clearTimers();
        timers.push(setTimeout(nextRound, 500));
      }
      b1.onclick = () => answer('first');
      b2.onclick = () => answer('second');
      playBtn.onclick = () => { if (!lock) play(btns.dataset.higherFirst === '1'); };
      timers.push(setTimeout(nextRound, 500));
      function finish() {
        const minSolved = correctGaps.length ? Math.min.apply(null, correctGaps) : level.startGap;
        ctx.finish({ minGapSolved: minSolved, accuracy: correct / rounds });
      }
      return function cleanup() { clearTimers(); };
    },
  };
})();

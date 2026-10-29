/** 空间记忆：记住亮起的顺序，再点一遍 */
(function () {
  HC.games = HC.games || {};
  HC.games.space = {
    run(mount, level, ctx) {
      const rows = level.rows, cols = level.cols;
      const cellsCount = rows * cols;
      const rounds = level.rounds;
      let cur = 0, correctRounds = 0, maxLen = level.startLen;
      let timers = [];
      let seq = [], input = [], lock = true, started = false, t0 = 0;

      const grid = HC.el('div', 'space-grid');
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      const cells = [];
      for (let i = 0; i < cellsCount; i += 1) {
        const c = HC.el('button', 'space-cell');
        c.onclick = () => tapCell(i);
        cells.push(c);
        grid.appendChild(c);
      }
      const prog = HC.el('div', 'space-prog', '看好亮起顺序…');
      mount.appendChild(grid); mount.appendChild(prog);

      function clearTimers() { timers.forEach(clearTimeout); timers = []; }
      function flash(seqArr) {
        lock = true;
        let i = 0;
        seqArr.forEach((idx, k) => {
          timers.push(setTimeout(() => {
            cells[idx].classList.add('lit');
            ctx.audio.tick();
          }, k * (level.lightMs + 220)));
          timers.push(setTimeout(() => cells[idx].classList.remove('lit'), k * (level.lightMs + 220) + level.lightMs));
        });
        timers.push(setTimeout(() => {
          prog.textContent = '该你啦，按刚才的顺序点';
          lock = false;
          if (started === false) { started = true; t0 = Date.now(); }
        }, seqArr.length * (level.lightMs + 220) + 200));
      }
      function newRound() {
        const len = Math.min(level.startLen + cur, 9);
        seq = [];
        const pool = Array.from({ length: cellsCount }, (_, i) => i);
        const shuffled = HC.shuffle(pool);
        seq = shuffled.slice(0, len);
        input = [];
        prog.textContent = `第 ${cur + 1} / ${rounds} 关 · 记住顺序`;
        flash(seq);
      }
      function tapCell(i) {
        if (lock) return;
        cells[i].classList.add('tap');
        setTimeout(() => cells[i].classList.remove('tap'), 150);
        input.push(i);
        const k = input.length - 1;
        if (input[k] !== seq[k]) {
          // 出错，本关结束
          ctx.fbBad();
          lock = true;
          setTimeout(() => { cur += 1; if (cur >= rounds) finish(); else newRound(); }, 500);
          return;
        }
        if (input.length === seq.length) {
          correctRounds += 1; maxLen = Math.max(maxLen, seq.length);
          ctx.fbOk();
          lock = true;
          setTimeout(() => { cur += 1; if (cur >= rounds) finish(); else newRound(); }, 500);
        }
      }
      function finish() {
        ctx.finish({ maxLen, accuracy: correctRounds / rounds });
      }
      timers.push(setTimeout(newRound, 400));
      return function cleanup() { clearTimers(); };
    },
  };
})();

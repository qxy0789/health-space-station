/** 视觉搜索：在格子里找出目标 */
(function () {
  HC.games = HC.games || {};
  HC.games.search = {
    run(mount, level, ctx) {
      const grid = level.grid;
      const rounds = level.rounds;
      let cur = 0, correct = 0;
      let rts = [];
      let timer = null, lock = false, started = false, t0 = 0;
      const preview = HC.el('div', 'search-preview');
      const wrap = HC.el('div', 'search-grid');
      wrap.style.gridTemplateColumns = `repeat(${grid}, 1fr)`;
      const prog = HC.el('div', 'search-prog');
      mount.appendChild(preview); mount.appendChild(wrap); mount.appendChild(prog);

      const base = '#9AA7C7', target = '#FF6B2C';
      function nextRound() {
        if (cur >= rounds) return finish();
        lock = false;
        HC.clear(wrap);
        const tIdx = HC.rndInt(0, grid * grid - 1);
        for (let i = 0; i < grid * grid; i += 1) {
          const c = HC.el('button', 'search-cell');
          c.style.background = i === tIdx ? target : base;
          c.onclick = () => answer(i === tIdx);
          wrap.appendChild(c);
        }
        preview.innerHTML = '目标 <span class="search-target" style="background:' + target + '"></span>';
        prog.textContent = `第 ${cur + 1} / ${rounds} 关`;
        if (started === false) { started = true; t0 = Date.now(); }
        clearTimeout(timer);
        timer = setTimeout(() => { if (!lock) { lock = true; miss(); } }, level.limitMs);
      }
      function answer(ok) {
        if (lock) return;
        lock = true; clearTimeout(timer);
        if (ok) { correct += 1; rts.push(Date.now() - t0); ctx.fbOk(); }
        else ctx.fbBad();
        cur += 1; setTimeout(nextRound, 300);
      }
      function miss() { ctx.fbBad(); cur += 1; setTimeout(nextRound, 300); }
      function finish() {
        const avgRt = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : level.rtBad;
        ctx.finish({ avgRt, accuracy: correct / rounds });
      }
      nextRound();
      return function cleanup() { clearTimeout(timer); };
    },
  };
})();

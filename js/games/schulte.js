/** 舒尔特方格：按 1→N 顺序点击 */
(function () {
  HC.games = HC.games || {};
  HC.games.schulte = {
    run(mount, level, ctx) {
      const size = level.size;
      const n = size * size;
      const nums = HC.shuffle(Array.from({ length: n }, (_, i) => i + 1));
      let next = 1;
      let errors = 0;
      let started = false;
      let t0 = 0;
      const wrap = HC.el('div', 'schulte-grid');
      wrap.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
      const cells = [];
      nums.forEach((v) => {
        const c = HC.el('button', 'schulte-cell', String(v));
        const jitter = level.fontJitter || 0;
        const rot = (Math.random() * 2 - 1) * (level.rotate || 0);
        const scale = 1 + (Math.random() * 2 - 1) * jitter * 0.3;
        c.style.transform = `rotate(${rot}deg) scale(${scale})`;
        c.dataset.v = v;
        c.onclick = () => {
          if (started === false) { started = true; t0 = Date.now(); }
          if (v === next) {
            c.classList.add('done');
            next += 1;
            if (next > n) finish();
          } else {
            errors += 1;
            c.classList.add('wrong');
            setTimeout(() => c.classList.remove('wrong'), 280);
          }
        };
        cells.push(c);
        wrap.appendChild(c);
      });
      mount.appendChild(wrap);
      const tip = HC.el('p', 'game-hint', '按顺序点 1、2、3……');
      mount.appendChild(tip);
      function finish() {
        ctx.finish({ durationMs: Date.now() - t0, errors });
      }
      return function cleanup() {};
    },
  };
})();

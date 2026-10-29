/** 数字划消：把指定数字全部划掉 */
(function () {
  HC.games = HC.games || {};
  HC.games.cancel = {
    run(mount, level, ctx) {
      const rows = level.rows, cols = level.cols;
      const total = rows * cols;
      // 选定 targets 个目标数字（取出现过的）
      const all = Array.from({ length: total }, () => HC.rndInt(0, 9));
      const byDigit = {};
      all.forEach((d) => { (byDigit[d] = byDigit[d] || []).push(1); });
      const present = Object.keys(byDigit).map(Number);
      const targetDigits = HC.shuffle(present).slice(0, Math.min(level.targets, present.length));
      const targetSet = new Set(targetDigits);
      const totalTargets = all.filter((d) => targetSet.has(d)).length;
      let found = 0, errors = 0, started = false, t0 = 0;

      const head = HC.el('div', 'cancel-head');
      head.innerHTML = `划掉所有 <b>${targetDigits.join('、')}</b>`;
      mount.appendChild(head);
      const wrap = HC.el('div', 'cancel-grid');
      wrap.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      all.forEach((d) => {
        const c = HC.el('button', 'cancel-cell', String(d));
        const isTarget = targetSet.has(d);
        c.onclick = () => {
          if (started === false) { started = true; t0 = Date.now(); }
          if (c.classList.contains('done')) return;
          if (isTarget) {
            c.classList.add('done');
            found += 1;
            ctx.fbOk();
            if (found >= totalTargets) finish();
          } else {
            errors += 1;
            ctx.fbBad();
            c.classList.add('wrong');
            setTimeout(() => c.classList.remove('wrong'), 280);
          }
        };
        wrap.appendChild(c);
      });
      mount.appendChild(wrap);
      function finish() {
        const hitRate = totalTargets ? found / totalTargets : 1;
        ctx.finish({ durationMs: Date.now() - t0, hitRate, errors });
      }
      return function cleanup() {};
    },
  };
})();

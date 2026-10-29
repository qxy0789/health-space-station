/** 找不同：左右两幅图，点出右边不一样的地方 */
(function () {
  HC.games = HC.games || {};
  HC.games.diff = {
    run(mount, level, ctx) {
      const items = level.items;
      const diffs = level.diffs;
      const pool = ['🌞','🌸','⭐','🐱','🍎','🚀','🌈','🐟','🍀','🔔','🐝','🌙','🍩','🐢','🍉','🦋','🌻','🐬'];
      const cols = 4;
      const baseSyms = Array.from({ length: items }, () => pool[HC.rndInt(0, pool.length - 1)]);
      // 选不同的位置
      const idxs = HC.shuffle(Array.from({ length: items }, (_, i) => i)).slice(0, diffs);
      const diffSet = new Set(idxs);
      const rightSyms = baseSyms.slice();
      idxs.forEach((i) => {
        let alt = pool[HC.rndInt(0, pool.length - 1)];
        while (alt === rightSyms[i]) alt = pool[HC.rndInt(0, pool.length - 1)];
        rightSyms[i] = alt;
      });
      let found = 0, errors = 0, started = false, t0 = 0;
      const board = HC.el('div', 'diff-board');
      const left = HC.el('div', 'diff-side'); left.style.gridTemplateColumns = `repeat(${cols},1fr)`;
      const right = HC.el('div', 'diff-side'); right.style.gridTemplateColumns = `repeat(${cols},1fr)`;
      baseSyms.forEach((s) => { const c = HC.el('div', 'diff-cell', s); left.appendChild(c); });
      rightSyms.forEach((s, i) => {
        const c = HC.el('button', 'diff-cell diff-tap', s);
        c.onclick = () => {
          if (started === false) { started = true; t0 = Date.now(); }
          if (c.classList.contains('found')) return;
          if (diffSet.has(i)) {
            c.classList.add('found'); found += 1; ctx.fbOk();
            if (found >= diffs) finish();
          } else {
            errors += 1; ctx.fbBad();
            c.classList.add('wrong');
            setTimeout(() => c.classList.remove('wrong'), 280);
          }
        };
        right.appendChild(c);
      });
      board.appendChild(left); board.appendChild(right);
      mount.appendChild(board);
      mount.appendChild(HC.el('p', 'game-hint', '右边哪几处和左边不一样？点出来'));
      function finish() { ctx.finish({ durationMs: Date.now() - t0, errors }); }
      return function cleanup() {};
    },
  };
})();

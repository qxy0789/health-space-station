/** 颜色归位：把同色块送进对应颜色的瓶子 */
(function () {
  HC.games = HC.games || {};
  HC.games.water = {
    run(mount, level, ctx) {
      const colors = ['#FF6B2C', '#2E86DE', '#27AE60', '#8E44AD', '#E0A800', '#16A085'];
      const palette = colors.slice(0, level.colors);
      const per = level.perColor;
      let tokens = [];
      palette.forEach((c) => { for (let i = 0; i < per; i += 1) tokens.push(c); });
      tokens = HC.shuffle(tokens);
      let correct = 0, wrong = 0, moves = 0, started = false, t0 = 0;
      let selected = null;

      const board = HC.el('div', 'water-board');
      const tokensWrap = HC.el('div', 'water-tokens');
      const binsWrap = HC.el('div', 'water-bins');
      mount.appendChild(board);
      board.appendChild(tokensWrap); board.appendChild(binsWrap);
      mount.appendChild(HC.el('p', 'game-hint', '点一个色块，再点同色的瓶子放进去'));

      const tokenEls = [];
      tokens.forEach((c, i) => {
        const t = HC.el('button', 'water-token');
        t.style.background = c; t.dataset.c = c;
        t.onclick = () => {
          if (started === false) { started = true; t0 = Date.now(); }
          selected = { c, el: t };
          tokenEls.forEach((x) => x.classList.remove('sel'));
          t.classList.add('sel');
        };
        tokenEls.push(t);
        tokensWrap.appendChild(t);
      });
      palette.forEach((c) => {
        const b = HC.el('button', 'water-bin');
        b.style.borderColor = c;
        b.style.background = c + '22';
        b.dataset.c = c;
        const dot = HC.el('span', 'wb-dot'); dot.style.background = c; b.appendChild(dot);
        b.onclick = () => {
          if (!selected) return;
          moves += 1;
          if (selected.c === c) {
            correct += 1; ctx.fbOk();
            selected.el.remove();
            b.classList.add('filled');
            selected = null;
            if (correct >= tokens.length) finish();
          } else {
            wrong += 1; ctx.fbBad();
            selected.el.classList.remove('sel');
            selected = null;
          }
        };
        binsWrap.appendChild(b);
      });
      function finish() {
        const stepEff = moves ? correct / moves : 1;
        ctx.finish({ stepEff, undo: wrong });
      }
      return function cleanup() {};
    },
  };
})();

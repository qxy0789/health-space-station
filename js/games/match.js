/** 翻牌配对：翻开两张找相同 */
(function () {
  HC.games = HC.games || {};
  HC.games.match = {
    run(mount, level, ctx) {
      const pairs = level.pairs;
      const cols = level.cols;
      const emojis = ['🍎','🍌','🍇','🍉','🍓','🍒','🥝','🍑','🍍','🥥','🍋','🍊','🥭','🫐','🍐','🍈','🌽','🥕','🌶️','🍄'];
      const pick = HC.shuffle(emojis).slice(0, pairs);
      const deck = HC.shuffle(pick.concat(pick));
      let flips = 0, errors = 0, matched = 0;
      let first = null, lock = false, started = false, t0 = 0;
      const wrap = HC.el('div', 'match-grid');
      wrap.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      const cells = [];
      deck.forEach((sym, i) => {
        const c = HC.el('button', 'match-cell');
        c.dataset.sym = sym;
        c.dataset.idx = i;
        c.innerHTML = '<span class="mc-back">?</span>';
        c.onclick = () => {
          if (lock || c.classList.contains('open') || c.classList.contains('matched')) return;
          if (started === false) { started = true; t0 = Date.now(); }
          c.classList.add('open');
          c.innerHTML = `<span class="mc-face">${sym}</span>`;
          flips += 1;
          if (!first) { first = c; return; }
          if (first.dataset.sym === c.dataset.sym) {
            first.classList.add('matched'); c.classList.add('matched');
            first = null; matched += 1; ctx.fbOk();
            if (matched >= pairs) finish();
          } else {
            errors += 1; ctx.fbBad();
            const a = first, b = c; first = null; lock = true;
            setTimeout(() => {
              a.classList.remove('open'); b.classList.remove('open');
              a.innerHTML = '<span class="mc-back">?</span>'; b.innerHTML = '<span class="mc-back">?</span>';
              lock = false;
            }, 650);
          }
        };
        cells.push(c);
        wrap.appendChild(c);
      });
      mount.appendChild(wrap);
      function finish() {
        ctx.finish({ durationMs: Date.now() - t0, flips, errors });
      }
      return function cleanup() { lock = true; };
    },
  };
})();

/** 颜色判断（Stroop）：只看字的颜色，不读字的意思 */
(function () {
  HC.games = HC.games || {};
  HC.games.stroop = {
    run(mount, level, ctx) {
      const colors = [
        { name: '红', hex: '#E53935' },
        { name: '蓝', hex: '#1E88E5' },
        { name: '绿', hex: '#43A047' },
        { name: '黄', hex: '#FDD835' },
      ];
      const rounds = level.rounds;
      let cur = 0, correct = 0;
      let rts = [];
      let timer = null, lock = false, started = false, t0 = 0;

      const word = HC.el('div', 'stroop-word');
      const pad = HC.el('div', 'stroop-pad');
      const btns = colors.map((c) => {
        const b = HC.el('button', 'stroop-btn');
        b.style.background = c.hex;
        b.dataset.hex = c.hex;
        b.onclick = () => answer(c.hex);
        pad.appendChild(b);
        return b;
      });
      const prog = HC.el('div', 'stroop-prog');
      mount.appendChild(word); mount.appendChild(pad); mount.appendChild(prog);

      function nextRound() {
        if (cur >= rounds) return finish();
        lock = false;
        const ink = colors[HC.rndInt(0, 3)];
        let txt = colors[HC.rndInt(0, 3)];
        const w = HC.el('span'); w.textContent = txt.name; w.style.color = ink.hex;
        word.innerHTML = ''; word.appendChild(w);
        word.dataset.answer = ink.hex;
        if (started === false) { started = true; t0 = Date.now(); }
        prog.textContent = `第 ${cur + 1} / ${rounds} 关`;
        clearTimeout(timer);
        timer = setTimeout(() => { if (!lock) { lock = true; wrong(); } }, level.limitMs);
      }
      function answer(hex) {
        if (lock) return;
        lock = true; clearTimeout(timer);
        const rt = Date.now() - t0;
        if (hex === word.dataset.answer) { correct += 1; rts.push(rt); ctx.fbOk(); }
        else { ctx.fbBad(); }
        cur += 1; setTimeout(nextRound, 320);
      }
      function wrong() { ctx.fbBad(); cur += 1; setTimeout(nextRound, 320); }
      function finish() {
        const avgRt = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : level.rtBad;
        ctx.finish({ avgRt, accuracy: correct / rounds });
      }
      nextRound();
      return function cleanup() { clearTimeout(timer); };
    },
  };
})();

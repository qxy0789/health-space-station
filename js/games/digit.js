/** 数字记忆：记住一串数字再复述（可正序/倒序） */
(function () {
  HC.games = HC.games || {};
  HC.games.digit = {
    run(mount, level, ctx) {
      const rounds = level.rounds;
      const mode = level.mode; // normal | reverse
      let cur = 0, correctCount = 0, maxSpan = level.startSpan;
      let timer = null;

      const show = HC.el('div', 'digit-show');
      const input = HC.el('div', 'digit-input');
      const pad = HC.el('div', 'digit-pad');
      const prog = HC.el('div', 'digit-prog');
      const submit = HC.el('button', 'btn-primary digit-submit', '确定');
      mount.appendChild(show); mount.appendChild(input); mount.appendChild(pad); mount.appendChild(submit); mount.appendChild(prog);

      let expected = '', buf = '';
      const digits = ['0','1','2','3','4','5','6','7','8','9'];
      digits.forEach((d) => {
        const b = HC.el('button', 'digit-key', d);
        b.onclick = () => { if (buf.length < 12) { buf += d; renderInput(); } };
        pad.appendChild(b);
      });
      const del = HC.el('button', 'digit-key del', '⌫');
      del.onclick = () => { buf = buf.slice(0, -1); renderInput(); };
      pad.appendChild(del);
      function renderInput() { input.textContent = buf ? buf.split('').join(' ') : '—'; }

      function nextRound() {
        if (cur >= rounds) return finish();
        buf = '';
        const len = Math.min(level.startSpan + cur, 9);
        let seq = '';
        for (let i = 0; i < len; i += 1) seq += String(HC.rndInt(0, 9));
        expected = mode === 'reverse' ? seq.split('').reverse().join('') : seq;
        show.textContent = seq;
        show.className = 'digit-show show';
        prog.textContent = `第 ${cur + 1} / ${rounds} 关${mode === 'reverse' ? '（倒序复述）' : ''}`;
        input.textContent = '—';
        submit.style.display = 'none';
        pad.style.display = 'none';
        clearTimeout(timer);
        timer = setTimeout(() => {
          show.className = 'digit-show';
          show.textContent = '请输入你记住的数字';
          pad.style.display = 'grid';
          submit.style.display = 'block';
        }, level.showMs);
      }
      submit.onclick = () => {
        if (!buf) return;
        if (buf === expected) {
          correctCount += 1;
          maxSpan = Math.max(maxSpan, expected.length);
          ctx.fbOk();
        } else {
          ctx.fbBad();
        }
        cur += 1;
        setTimeout(nextRound, 360);
      };
      function finish() {
        ctx.finish({ maxSpan, accuracy: correctCount / rounds });
      }
      nextRound();
      return function cleanup() { clearTimeout(timer); };
    },
  };
})();

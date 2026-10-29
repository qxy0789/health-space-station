/** 记忆更新（N-Back）：和前面第 n 个一样吗 */
(function () {
  HC.games = HC.games || {};
  HC.games.nback = {
    run(mount, level, ctx) {
      const n = level.n;
      const trials = level.trials;
      // 生成序列（含前 n 个填充）
      const seq = [];
      for (let i = 0; i < trials + n; i += 1) seq.push(HC.rndInt(1, 9));
      let idx = 0;
      let signal = 0, noise = 0, hit = 0, cr = 0, fa = 0;
      let rts = [];
      let timer = null, lock = false, started = false, t0 = 0;
      const stim = HC.el('div', 'nback-stim');
      const btns = HC.el('div', 'nback-btns');
      const same = HC.el('button', 'nback-btn same', '相同');
      const diff = HC.el('button', 'nback-btn diff', '不同');
      btns.appendChild(same); btns.appendChild(diff);
      const prog = HC.el('div', 'nback-prog');
      mount.appendChild(stim); mount.appendChild(btns); mount.appendChild(prog);

      function invNorm(p) {
        p = Math.min(0.999, Math.max(0.001, p));
        const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
        const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
        const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
        const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
        const pLow = 0.02425, pHigh = 1 - pLow;
        let q, r;
        if (p < pLow) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
        if (p <= pHigh) { q = p - 0.5; r = q*q; return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1); }
        q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
      }

      function step() {
        if (idx >= seq.length) return finish();
        lock = false;
        const isResp = idx >= n;
        const isSignal = isResp && seq[idx] === seq[idx - n];
        stim.textContent = seq[idx];
        stim.className = 'nback-stim show';
        prog.textContent = `第 ${idx + 1} / ${seq.length} 个${isResp ? '' : '（热身）'}`;
        btns.style.display = isResp ? 'flex' : 'none';
        if (started === false) { started = true; t0 = Date.now(); }
        clearTimeout(timer);
        timer = setTimeout(() => {
          stim.className = 'nback-stim';
          if (isResp) {
            // 等待用户响应（最长 windowMs）
            timer = setTimeout(() => resolve(null, isSignal), level.windowMs);
          } else {
            idx += 1; setTimeout(step, 250);
          }
        }, isResp ? 600 : 600);
      }
      function resolve(ans, isSignal) {
        lock = true; clearTimeout(timer);
        if (isSignal) { signal += 1; if (ans === 'same') { hit += 1; rts.push(Date.now() - t0); ctx.fbOk(); } else ctx.fbBad(); }
        else { noise += 1; if (ans === 'diff') { cr += 1; rts.push(Date.now() - t0); ctx.fbOk(); } else if (ans === 'same') { fa += 1; ctx.fbBad(); } else ctx.fbBad(); }
        // t0 重置为下一次响应起始
        idx += 1; setTimeout(step, 300); t0 = Date.now();
      }
      same.onclick = () => { if (lock) return; const isSignal = (idx >= n) && seq[idx] === seq[idx - n]; resolve('same', isSignal); };
      diff.onclick = () => { if (lock) return; const isSignal = (idx >= n) && seq[idx] === seq[idx - n]; resolve('diff', isSignal); };

      function finish() {
        const hR = signal ? hit / signal : 0;
        const fR = noise ? fa / noise : 0;
        const dprime = signal && noise ? Math.max(0, Math.min(3, invNorm(hR) - invNorm(fR))) : 0;
        const avgRt = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : level.rtBad;
        const acc = (signal + noise) ? (hit + cr) / (signal + noise) : 0;
        ctx.finish({ avgRt, dprime, accuracy: acc });
      }
      setTimeout(step, 400);
      return function cleanup() { clearTimeout(timer); };
    },
  };
})();

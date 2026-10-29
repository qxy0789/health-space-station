/** 红灯停绿灯行（GO/NO-GO）：绿灯快点，红灯忍住 */
(function () {
  HC.games = HC.games || {};
  HC.games.gonogo = {
    run(mount, level, ctx) {
      const trials = level.trials;
      const isi = level.isiMs;
      let cur = 0;
      let goTrials = 0, goHits = 0, noGoTrials = 0, noGoCorrect = 0, noGoErr = 0;
      let rts = [];
      let windowOpen = false, lock = false;
      let timers = [];
      const stim = HC.el('div', 'gonogo-stim');
      const tap = HC.el('div', 'gonogo-tap');
      const prog = HC.el('div', 'gonogo-prog', '准备…');
      mount.appendChild(stim); mount.appendChild(tap); mount.appendChild(prog);

      function clearTimers() { timers.forEach(clearTimeout); timers = []; }
      tap.onclick = () => {
        if (!windowOpen) return; // 只在刺激亮起时响应
        windowOpen = false; lock = true;
        if (curData.go) {
          goHits += 1;
          const rt = Date.now() - stimShownAt;
          rts.push(rt);
          ctx.audio.go();
        } else {
          noGoErr += 1;
          ctx.fbBad();
        }
      };
      let curData = null, stimShownAt = 0;
      function trial() {
        if (cur >= trials) return finish();
        const go = Math.random() < level.goRatio;
        curData = { go };
        windowOpen = false; lock = false;
        prog.textContent = `第 ${cur + 1} / ${trials} 次`;
        // 短暂停顿（间隔）
        timers.push(setTimeout(() => {
          stim.className = 'gonogo-stim ' + (go ? 'go' : 'nogo');
          stim.textContent = go ? '点!' : '别动';
          stimShownAt = Date.now();
          windowOpen = true;
          ctx.audio[go ? 'tick' : 'noGo']();
          // 刺激窗口
          timers.push(setTimeout(() => {
            windowOpen = false;
            if (curData.go) {
              goTrials += 1;
              if (!lock) { /* 漏点 */ }
            } else {
              noGoTrials += 1;
              if (!lock) { noGoCorrect += 1; ctx.fbOk(); }
            }
            stim.className = 'gonogo-stim';
            stim.textContent = '';
            cur += 1;
            timers.push(setTimeout(trial, isi));
          }, go ? 600 : 600));
        }, isi));
      }
      function finish() {
        const avgRt = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : level.rtBad;
        const goAcc = goTrials ? goHits / goTrials : 0;
        const control = (goHits + noGoCorrect) / Math.max(1, (goTrials + noGoTrials));
        ctx.finish({ avgRt, goAcc, control, adapt: goAcc });
      }
      timers.push(setTimeout(trial, 500));
      return function cleanup() { clearTimers(); };
    },
  };
})();

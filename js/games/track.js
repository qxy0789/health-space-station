/** 目标追踪：盯住会动的球，停下后点出目标 */
(function () {
  HC.games = HC.games || {};
  HC.games.track = {
    run(mount, level, ctx) {
      const N = level.balls, T = level.targets, moveMs = level.moveMs;
      const wrap = HC.el('div', 'track-wrap');
      const canvas = HC.el('canvas', 'track-canvas');
      const tip = HC.el('p', 'game-hint', '记住高亮的目标球…');
      const done = HC.el('button', 'btn-primary track-done', '我点完了');
      done.style.display = 'none';
      mount.appendChild(wrap); wrap.appendChild(canvas); mount.appendChild(tip); mount.appendChild(done);

      const W = wrap.clientWidth || 320, H = Math.round(W * 1.1);
      canvas.width = W; canvas.height = H;
      const ctx2d = canvas.getContext('2d');
      const balls = [];
      for (let i = 0; i < N; i += 1) {
        balls.push({
          x: 20 + Math.random() * (W - 40),
          y: 20 + Math.random() * (H - 40),
          vx: (Math.random() * 2 - 1) * (1 + level.speed * 8),
          vy: (Math.random() * 2 - 1) * (1 + level.speed * 8),
          r: 12,
          target: i < T,
          found: false,
        });
      }
      let raf = null, moving = true, started = false, t0 = 0, freezeAt = 0;
      let lost = 0, correct = 0;
      function step() {
        if (moving) {
          ctx2d.clearRect(0, 0, W, H);
          balls.forEach((b) => {
            b.x += b.vx; b.y += b.vy;
            if (b.x < b.r || b.x > W - b.r) b.vx *= -1;
            if (b.y < b.r || b.y > H - b.r) b.vy *= -1;
            ctx2d.beginPath();
            ctx2d.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            if (b.target) { ctx2d.fillStyle = '#FF6B2C'; ctx2d.fill(); ctx2d.lineWidth = 3; ctx2d.strokeStyle = '#fff'; ctx2d.stroke(); }
            else { ctx2d.fillStyle = '#5B6FFF'; ctx2d.fill(); }
          });
          if (started === false) { started = true; }
          raf = requestAnimationFrame(step);
        }
      }
      function startMove() { t0 = Date.now(); raf = requestAnimationFrame(step); }
      setTimeout(() => {
        moving = false;
        if (raf) cancelAnimationFrame(raf);
        tip.textContent = '点出你记住的橙色目标球';
        done.style.display = 'block';
        freezeAt = Date.now();
        // 重绘静止帧
        ctx2d.clearRect(0, 0, W, H);
        balls.forEach((b) => {
          ctx2d.beginPath(); ctx2d.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          if (b.target) { ctx2d.fillStyle = '#FF6B2C'; ctx2d.fill(); ctx2d.lineWidth = 3; ctx2d.strokeStyle = '#fff'; ctx2d.stroke(); }
          else { ctx2d.fillStyle = '#5B6FFF'; ctx2d.fill(); }
        });
      }, moveMs);

      function pick(px, py) {
        if (moving) return;
        let hit = -1, best = 1e9;
        balls.forEach((b, i) => {
          const d = Math.hypot(b.x - px, b.y - py);
          if (d < b.r + 10 && d < best) { best = d; hit = i; }
        });
        if (hit < 0) return;
        const b = balls[hit];
        if (b.target && !b.found) { b.found = true; correct += 1; ctx.fbOk(); }
        else if (!b.target) { lost += 1; ctx.fbBad(); }
        // 标记点过
        ctx2d.beginPath(); ctx2d.arc(b.x, b.y, b.r + 4, 0, Math.PI * 2);
        ctx2d.strokeStyle = b.found ? '#1E7A48' : '#A8452F'; ctx2d.lineWidth = 2; ctx2d.stroke();
        if (correct >= T) finish();
      }
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        pick(e.clientX - rect.left, e.clientY - rect.top);
      });
      done.onclick = () => finish();
      function finish() {
        const avgRt = freezeAt ? Date.now() - freezeAt : 0;
        const acc = T ? correct / T : 0;
        ctx.finish({ avgRt, acc, lost });
      }
      startMove();
      return function cleanup() { if (raf) cancelAnimationFrame(raf); };
    },
  };
})();

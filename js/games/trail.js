/** 连线游戏：按 1→N 顺序点击节点（顺序即连线） */
(function () {
  HC.games = HC.games || {};
  HC.games.trail = {
    run(mount, level, ctx) {
      const nodes = level.nodes;
      const area = HC.el('div', 'trail-area');
      mount.appendChild(area);
      // 计算不重叠坐标（百分比）
      const pts = [];
      let guard = 0;
      while (pts.length < nodes && guard < 2000) {
        guard += 1;
        const x = 10 + Math.random() * 80;
        const y = 12 + Math.random() * 76;
        if (pts.every((p) => Math.hypot(p.x - x, p.y - y) > 12)) pts.push({ x, y });
      }
      const taps = [];
      let next = 1;
      let errors = 0;
      let started = false, t0 = 0;
      const nodeEls = [];
      pts.forEach((p, i) => {
        const c = HC.el('button', 'trail-node', String(i + 1));
        c.style.left = p.x + '%';
        c.style.top = p.y + '%';
        c.onclick = () => {
          if (started === false) { started = true; t0 = Date.now(); }
          if (i + 1 === next) {
            c.classList.add('hit');
            taps.push(Date.now());
            next += 1;
            ctx.fbOk();
            if (next > nodes) finish();
          } else {
            errors += 1;
            ctx.fbBad();
            c.classList.add('wrong');
            setTimeout(() => c.classList.remove('wrong'), 250);
          }
        };
        nodeEls.push(c);
        area.appendChild(c);
      });
      const hint = HC.el('p', 'game-hint', '按顺序点亮 1 到 ' + nodes);
      mount.appendChild(hint);
      function finish() {
        const seg = [];
        for (let i = 1; i < taps.length; i += 1) seg.push(taps[i] - taps[i - 1]);
        const avg = seg.length ? seg.reduce((a, b) => a + b, 0) / seg.length : 0;
        const variance = seg.length ? seg.reduce((a, b) => a + (b - avg) * (b - avg), 0) / seg.length : 0;
        const sd = Math.sqrt(variance);
        ctx.finish({ durationMs: Date.now() - t0, avgRt: avg, rtSd: sd, errors });
      }
      return function cleanup() {};
    },
  };
})();

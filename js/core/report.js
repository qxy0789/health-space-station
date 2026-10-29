/**
 * 健康空间站 · 分析报告（端上生成）
 * 移植自原小程序 report.js：五维雷达 + 综合评级 + 反应稳定性 + 同关对比 + 周洞察。
 */
window.HC = window.HC || {};
(function () {
  const { GAMES, GAME_MAP, DIMS } = HC.meta;
  const { gradeOf, stabilityOf } = HC.score;
  const { summarize, shiftDay } = HC.stats;

  function radarOf(records) {
    const acc = {};
    const wsum = {};
    (records || []).forEach((r) => {
      const meta = GAME_MAP[r.gameId];
      if (!meta) return;
      const score = Number(r.score) || 0;
      Object.keys(meta.dims).forEach((k) => {
        const w = meta.dims[k];
        acc[k] = (acc[k] || 0) + w * score;
        wsum[k] = (wsum[k] || 0) + w;
      });
    });
    return DIMS.map((d) => {
      const hasData = !!wsum[d.key];
      const value = hasData ? Math.round(acc[d.key] / wsum[d.key]) : 0;
      return { key: d.key, name: d.name, desc: d.desc, value, hasData };
    });
  }
  function levelText(id) { return { easy: '简单', medium: '中等', hard: '困难' }[id] || ''; }
  function compareOf(records) {
    const buckets = {};
    (records || []).forEach((r) => {
      if (!GAME_MAP[r.gameId]) return;
      const k = `${r.gameId}|${r.levelId}`;
      if (!buckets[k]) buckets[k] = [];
      if (buckets[k].length < 2) buckets[k].push(r);
    });
    let picked = null;
    Object.keys(buckets).forEach((k) => {
      const arr = buckets[k];
      if (arr.length < 2) return;
      if (!picked || (arr[0].endedAt || 0) > (picked.list[0].endedAt || 0)) picked = { key: k, list: arr };
    });
    if (!picked) return null;
    const last = picked.list[0];
    const prev = picked.list[1];
    const meta = GAME_MAP[last.gameId];
    const deltaScore = (last.score || 0) - (prev.score || 0);
    const deltaSec = Math.round(((prev.durationMs || 0) - (last.durationMs || 0)) / 1000);
    let text = '';
    if (deltaScore > 0) text = `「${meta.name}·${levelText(last.levelId)}」这次 ${last.score} 分，比上次高 ${deltaScore} 分。`;
    else if (deltaScore < 0) text = `「${meta.name}·${levelText(last.levelId)}」这次 ${last.score} 分，和上次差不多，再练一局就稳了。`;
    else text = `「${meta.name}·${levelText(last.levelId)}」两次都是 ${last.score} 分，状态很稳。`;
    if (deltaSec > 2 && deltaScore >= 0) text += `用时快了 ${deltaSec} 秒。`;
    return { gameId: last.gameId, name: meta.name, levelId: last.levelId, levelName: levelText(last.levelId), lastScore: last.score, prevScore: prev.score, deltaScore, deltaSec, text };
  }
  function weekTrend(calendar, today) {
    let thisWeek = 0, lastWeek = 0;
    for (let i = 0; i < 7; i += 1) if (calendar[shiftDay(today, -i)]) thisWeek += 1;
    for (let i = 7; i < 14; i += 1) if (calendar[shiftDay(today, -i)]) lastWeek += 1;
    return { thisWeek, lastWeek };
  }
  const DIM_TIP = {
    sustain: '练「舒尔特方格」和「目标追踪」最直接：一个练静下来找，一个练盯着不放。',
    memory: '练「数字记忆」「翻牌配对」「空间记忆」：先记住、再复述，是工作记忆最吃劲的地方。',
    visual: '练「视觉搜索」和「找不同」：别一个个死盯，先整体扫一遍。',
    control: '练「红灯停绿灯行」和「颜色判断」：忍住不动，比快速点下去更难。',
    speed: '练「连线游戏」：手上稳一点，速度会自己上来。',
  };
  function buildReport(records, opt) {
    const list = Array.isArray(records) ? records : [];
    const today = (opt && opt.today) || new Date().toISOString().slice(0, 10);
    const radar = radarOf(list);
    const valid = radar.filter((d) => d.hasData);
    const avgScore = valid.length ? Math.round(valid.reduce((s, d) => s + d.value, 0) / valid.length) : 0;
    const sum = summarize(list, { today });
    const stability = stabilityOf(list);
    const compare = compareOf(list);
    const trend = weekTrend(sum.calendar, today);
    const insights = [];
    if (list.length) {
      const r = list[0];
      const meta = GAME_MAP[r.gameId];
      const ratingText = r.score >= 85 ? '完成得很漂亮' : (r.score >= 60 ? '完成得不错' : '完成了一次，这就很好');
      insights.push({ icon: 'flag', title: '最近一次', text: `刚才练的是「${meta ? meta.name : r.gameId}」，${ratingText}，拿了 ${r.score} 分。` });
    } else {
      insights.push({ icon: 'flag', title: '还没开始', text: '先挑一个游戏玩一局，这里就会慢慢长出你的专属分析。' });
    }
    if (compare) insights.push({ icon: 'chart', title: '和上次比', text: compare.text });
    if (valid.length) {
      const weakest = valid.slice().sort((a, b) => a.value - b.value)[0];
      insights.push({ icon: 'lightbulb', title: `最值得练：${weakest.name}`, text: `目前 ${weakest.value} 分，是五维里最薄弱的一项。${DIM_TIP[weakest.key] || ''}` });
    }
    if (sum.total > 0) {
      const gapText = trend.thisWeek >= trend.lastWeek ? `这周练了 ${trend.thisWeek} 天，比上周不少。` : `这周练了 ${trend.thisWeek} 天，比上周少 ${trend.lastWeek - trend.thisWeek} 天，分散到每天更好。`;
      insights.push({ icon: 'calendar', title: '训练节奏', text: `${gapText}已累计 ${sum.total} 局、坚持 ${sum.days} 天，连续 ${sum.streakDays} 天。` });
    }
    const played = {};
    list.forEach((r) => { if (r.gameId) played[r.gameId] = 1; });
    const playedCount = Object.keys(played).length;
    return { sampleCount: list.length, avgScore, grade: gradeOf(avgScore), radar, stability, compare, insights: insights.slice(0, 4), coverage: { playedCount, totalGames: GAMES.filter((g) => g.online).length }, summary: sum };
  }

  HC.report = { buildReport, radarOf, compareOf, levelText };
})();

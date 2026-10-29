/**
 * 健康空间站 · 本地统计
 * 移植自原小程序 stats.js。口径：以「天」为最小粒度，坚持天数 = 有记录的自然日数。
 */
window.HC = window.HC || {};

function pad(n) { return n < 10 ? `0${n}` : String(n); }
function dayKeyOf(ts) {
  const d = new Date(Number(ts) || Date.now());
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function shiftDay(dayKey, n) {
  const parts = String(dayKey).split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + n);
  return dayKeyOf(d.getTime());
}
function weekStartKey(dayKey) {
  const parts = String(dayKey).split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const wd = d.getDay();
  const back = wd === 0 ? 6 : wd - 1;
  d.setDate(d.getDate() - back);
  return dayKeyOf(d.getTime());
}
function summarize(records, opt) {
  const list = Array.isArray(records) ? records : [];
  const today = (opt && opt.today) || dayKeyOf(Date.now());
  const goal = (opt && opt.goal) || DAILY_GOAL;
  const calendar = {};
  const bestByGame = {};
  const gameCount = {};
  let totalScore = 0;

  list.forEach((r) => {
    if (!r) return;
    const day = r.dayKey || dayKeyOf(r.endedAt || r.startedAt);
    calendar[day] = (calendar[day] || 0) + 1;
    const gid = r.gameId;
    if (gid) {
      gameCount[gid] = (gameCount[gid] || 0) + 1;
      const prev = bestByGame[gid];
      if (!prev || (r.score || 0) > prev.score) bestByGame[gid] = { score: r.score || 0, levelId: r.levelId || 'easy', at: r.endedAt || r.startedAt || 0 };
    }
    totalScore += Number(r.score) || 0;
  });

  const dayKeys = Object.keys(calendar).sort();
  let streakDays = 0;
  let cursor = calendar[today] ? today : shiftDay(today, -1);
  while (calendar[cursor]) {
    streakDays += 1;
    cursor = shiftDay(cursor, -1);
    if (streakDays > 400) break;
  }
  const weekStart = weekStartKey(today);
  let weekActive = 0;
  Object.keys(calendar).forEach((d) => { if (d >= weekStart && d <= today) weekActive += 1; });

  const last7 = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = shiftDay(today, -i);
    last7.push({ dayKey: d, label: d.slice(5).replace('-', '/'), count: calendar[d] || 0, weekday: '日一二三四五六'[new Date(d.replace(/-/g, '/')).getDay()] });
  }

  let favoriteGame = null;
  Object.keys(gameCount).forEach((gid) => {
    if (!favoriteGame || gameCount[gid] > favoriteGame.count) {
      const meta = HC.meta.GAME_MAP[gid];
      favoriteGame = { gameId: gid, name: meta ? meta.short : gid, count: gameCount[gid] };
    }
  });
  const todayCount = calendar[today] || 0;

  return {
    total: list.length,
    days: dayKeys.length,
    streakDays,
    weekActive,
    monthActive: Object.keys(calendar).filter((d) => d.slice(0, 7) === today.slice(0, 7)).length,
    avgScore: list.length ? Math.round(totalScore / list.length) : 0,
    favoriteGame,
    bestByGame,
    last7,
    calendar,
    today: { count: todayCount, goal, done: todayCount >= goal, pct: Math.min(100, Math.round((todayCount / goal) * 100)) },
  };
}
function buildMonth(calendar, month, today) {
  const t = today || dayKeyOf(Date.now());
  const ym = month || t.slice(0, 7);
  const parts = ym.split('-').map(Number);
  const first = new Date(parts[0], parts[1] - 1, 1);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(parts[0], parts[1], 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i += 1) cells.push({ key: `e${i}`, empty: true });
  for (let d = 1; d <= daysInMonth; d += 1) {
    const key = `${ym}-${pad(d)}`;
    const count = (calendar && calendar[key]) || 0;
    cells.push({ key, empty: false, day: d, count, isToday: key === t, golden: count >= 3, done: count > 0 });
  }
  while (cells.length % 7 !== 0) cells.push({ key: `t${cells.length}`, empty: true });
  return { month: ym, label: `${parts[0]} 年 ${parts[1]} 月`, cells, trainDays: cells.filter((c) => !c.empty && c.done).length };
}

HC.stats = { dayKeyOf, shiftDay, weekStartKey, summarize, buildMonth, pad };

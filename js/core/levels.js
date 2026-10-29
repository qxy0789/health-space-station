/**
 * 健康空间站 · 关卡参数表（唯一出口）
 * 移植自原小程序：所有难度数字集中在此，游戏页只 getLevel 拿配置。
 */
window.HC = window.HC || {};

const DAILY_GOAL = 3;

const LEVELS = {
  schulte: {
    easy: { size: 3, fontJitter: 0.30, rotate: 6, ghost: false, avgRtGood: 1500, avgRtBad: 4500, brief: '3×3' },
    medium: { size: 4, fontJitter: 0.30, rotate: 9, ghost: true, avgRtGood: 1700, avgRtBad: 5000, brief: '4×4' },
    hard: { size: 5, fontJitter: 0.40, rotate: 12, ghost: true, avgRtGood: 2000, avgRtBad: 5500, brief: '5×5' },
  },
  cancel: {
    easy: { rows: 5, cols: 6, targets: 1, cellRtGood: 800, cellRtBad: 2400, brief: '5×6' },
    medium: { rows: 6, cols: 7, targets: 2, cellRtGood: 700, cellRtBad: 2100, brief: '6×7' },
    hard: { rows: 8, cols: 8, targets: 3, cellRtGood: 600, cellRtBad: 1800, brief: '8×8' },
  },
  match: {
    easy: { pairs: 6, cols: 4, totalGood: 60, totalBad: 180, brief: '6 对' },
    medium: { pairs: 8, cols: 4, totalGood: 90, totalBad: 240, brief: '8 对' },
    hard: { pairs: 10, cols: 4, totalGood: 120, totalBad: 300, brief: '10 对' },
  },
  trail: {
    easy: { nodes: 10, segRtGood: 2800, segRtBad: 7600, brief: '10 点' },
    medium: { nodes: 15, segRtGood: 2550, segRtBad: 7000, brief: '15 点' },
    hard: { nodes: 20, segRtGood: 2200, segRtBad: 6400, brief: '20 点' },
  },
  diff: {
    easy: { diffs: 2, items: 14, totalGood: 40, totalBad: 120, brief: '2 处' },
    medium: { diffs: 3, items: 16, totalGood: 55, totalBad: 150, brief: '3 处' },
    hard: { diffs: 4, items: 18, totalGood: 70, totalBad: 180, brief: '4 处' },
  },
  stroop: {
    easy: { rounds: 5, limitMs: 3600, rtGood: 1500, rtBad: 4000, brief: '5 回合' },
    medium: { rounds: 10, limitMs: 3000, rtGood: 1400, rtBad: 3600, brief: '10 回合' },
    hard: { rounds: 15, limitMs: 2400, rtGood: 1300, rtBad: 3200, brief: '15 回合' },
  },
  gonogo: {
    easy: { trials: 20, isiMs: 1200, goRatio: 0.70, rtGood: 800, rtBad: 1800, brief: '20 次' },
    medium: { trials: 28, isiMs: 1000, goRatio: 0.75, rtGood: 750, rtBad: 1650, brief: '28 次' },
    hard: { trials: 36, isiMs: 850, goRatio: 0.80, rtGood: 700, rtBad: 1500, brief: '36 次' },
  },
  digit: {
    easy: { rounds: 8, showMs: 4500, mode: 'normal', startSpan: 3, brief: '正序' },
    medium: { rounds: 8, showMs: 3500, mode: 'normal', startSpan: 4, brief: '正序·长' },
    hard: { rounds: 8, showMs: 2500, mode: 'reverse', startSpan: 4, brief: '倒序' },
  },
  search: {
    easy: { grid: 3, rounds: 8, limitMs: 12000, rtGood: 6000, rtBad: 12000, brief: '3×3' },
    medium: { grid: 5, rounds: 10, limitMs: 9000, rtGood: 5000, rtBad: 9000, brief: '5×5' },
    hard: { grid: 7, rounds: 12, limitMs: 7000, rtGood: 4000, rtBad: 7000, brief: '7×7' },
  },
  nback: {
    easy: { n: 1, trials: 15, windowMs: 3600, rtGood: 900, rtBad: 2200, brief: '1 步' },
    medium: { n: 1, trials: 22, windowMs: 2900, rtGood: 900, rtBad: 2100, brief: '1 步·多' },
    hard: { n: 2, trials: 26, windowMs: 2300, rtGood: 950, rtBad: 2200, brief: '2 步' },
  },
  water: {
    easy: { colors: 3, perColor: 2, brief: '3 色·短' },
    medium: { colors: 3, perColor: 4, brief: '3 色·长' },
    hard: { colors: 6, perColor: 5, brief: '6 色' },
  },
  pitch: {
    easy: { rounds: 8, startGap: 7, minGap: 5, brief: '8 题' },
    medium: { rounds: 14, startGap: 5, minGap: 2, brief: '14 题' },
    hard: { rounds: 20, startGap: 2, minGap: 1.1, brief: '20 题' },
  },
  track: {
    easy: { balls: 8, targets: 1, moveMs: 6000, speed: 0.13, rtGood: 4000, rtBad: 12000, brief: '8 球·1' },
    medium: { balls: 12, targets: 3, moveMs: 12000, speed: 0.19, rtGood: 4500, rtBad: 13000, brief: '12 球·3' },
    hard: { balls: 18, targets: 5, moveMs: 22000, speed: 0.25, rtGood: 5000, rtBad: 14000, brief: '18 球·5' },
  },
  space: {
    easy: { rows: 3, cols: 3, startLen: 3, lightMs: 850, rounds: 8, brief: '3×3' },
    medium: { rows: 4, cols: 6, startLen: 3, lightMs: 650, rounds: 8, brief: '4×6' },
    hard: { rows: 6, cols: 9, startLen: 4, lightMs: 450, rounds: 8, brief: '6×9' },
  },
};

const LEVEL_IDS = ['easy', 'medium', 'hard'];

function getLevel(gameId, levelId) {
  const g = LEVELS[gameId];
  if (!g) return null;
  const lv = g[levelId] || g.easy;
  return Object.assign({ id: LEVEL_IDS.indexOf(levelId) >= 0 ? levelId : 'easy' }, lv);
}

function listLevels(gameId) {
  const g = LEVELS[gameId] || {};
  return LEVEL_IDS.filter((id) => g[id]).map((id) => ({ id, name: HC.meta.LEVEL_NAMES[id], brief: g[id].brief || '' }));
}

function defaultLevel(gameId, bestByGame) {
  const best = bestByGame && bestByGame[gameId];
  if (best && LEVELS[gameId] && LEVELS[gameId][best.levelId]) return best.levelId;
  return 'easy';
}

function advance(current, streak) {
  const idx = LEVEL_IDS.indexOf(current);
  if (idx < 0) return { next: 'easy', changed: 'keep' };
  const up = (streak && streak.up) || 0;
  const down = (streak && streak.down) || 0;
  if (up >= 2 && idx < LEVEL_IDS.length - 1) return { next: LEVEL_IDS[idx + 1], changed: 'up' };
  if (down >= 2 && idx > 0) return { next: LEVEL_IDS[idx - 1], changed: 'down' };
  return { next: LEVEL_IDS[idx], changed: 'keep' };
}

function isLevel(gameId, id) {
  return !!(LEVELS[gameId] && LEVELS[gameId][id]);
}

HC.levels = { LEVELS, LEVEL_IDS, DAILY_GOAL, getLevel, listLevels, defaultLevel, advance, isLevel };

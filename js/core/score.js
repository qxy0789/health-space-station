/**
 * 健康空间站 · 评分与评级（前端计算，本地存储）
 * 移植自原小程序 score.js。统一骨架：score = round(100 · Σ wᵢ·Nᵢ)。
 */
window.HC = window.HC || {};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function norm(v, good, bad) {
  if (!isFinite(v)) return 0;
  if (v <= good) return 1;
  if (v >= bad) return 0;
  return (bad - v) / (bad - good);
}
function clamp01(v) { return clamp(v, 0, 1); }
function cvOf(avg, sd) {
  if (!avg || !isFinite(avg) || !isFinite(sd)) return 0;
  return clamp(sd / avg, 0, 3);
}

function scoreOf(gameId, m, lv) {
  const g = HC.meta.GAME_MAP[gameId];
  if (!g || !lv) return { score: 0, accuracy: 0, parts: {} };
  const duration = Number(m.durationMs) || 0;
  const avgRt = Number(m.avgRt) || 0;
  const errors = Number(m.errors) || 0;
  const accuracy = clamp01(Number(m.accuracy) || 0);
  let score = 0;
  const parts = {};

  switch (gameId) {
    case 'schulte': {
      const cells = (lv.size || 3) * (lv.size || 3);
      const perCell = cells ? duration / cells : 0;
      parts.rt = norm(perCell, lv.avgRtGood, lv.avgRtBad);
      parts.err = clamp01(1 - errors * 0.1);
      score = 0.62 * parts.rt + 0.38 * parts.err;
      break;
    }
    case 'cancel': {
      const cells = (lv.rows || 5) * (lv.cols || 6);
      const perCell = cells ? duration / cells : 0;
      const hit = clamp01(Number(m.hitRate) || 0);
      parts.rt = norm(perCell, lv.cellRtGood, lv.cellRtBad) * hit;
      parts.hit = hit;
      parts.err = clamp01(1 - errors * 0.08);
      score = 0.55 * parts.rt + 0.30 * parts.hit + 0.15 * parts.err;
      break;
    }
    case 'match': {
      parts.rt = norm(duration, lv.totalGood * 1000, lv.totalBad * 1000);
      const pairs = Number(lv.pairs) || 6;
      const flips = Number(m.flips) || pairs * 2;
      parts.eff = clamp01((pairs * 2) / Math.max(pairs * 2, flips));
      parts.err = clamp01(1 - errors * 0.06);
      score = 0.55 * parts.rt + 0.30 * parts.eff + 0.15 * parts.err;
      break;
    }
    case 'trail': {
      const nodes = Number(lv.nodes) || 8;
      const perSeg = duration / Math.max(1, nodes - 1);
      parts.rt = norm(perSeg, lv.segRtGood, lv.segRtBad);
      parts.err = clamp01(1 - errors * 0.15);
      parts.smooth = clamp01(1 - cvOf(avgRt, Number(m.rtSd) || 0) / 0.8);
      score = 0.65 * parts.rt + 0.25 * parts.err + 0.10 * parts.smooth;
      break;
    }
    case 'diff': {
      parts.rt = norm(duration / 1000, lv.totalGood, lv.totalBad);
      parts.err = clamp(1 - errors * 0.1, 0.6, 1);
      score = 0.60 * parts.rt + 0.40 * parts.err;
      break;
    }
    case 'stroop': {
      parts.acc = accuracy;
      parts.rt = norm(avgRt, lv.rtGood, lv.rtBad);
      score = 0.60 * parts.acc + 0.40 * parts.rt;
      break;
    }
    case 'gonogo': {
      const goAcc = clamp01(Number(m.goAcc) || 0);
      parts.speed = norm(avgRt, lv.rtGood, lv.rtBad);
      parts.control = clamp01(Number(m.control) || 0) * goAcc;
      parts.goAcc = goAcc;
      parts.adapt = clamp01(Number(m.adapt) || 0);
      score = 0.20 * parts.speed + 0.45 * parts.control + 0.20 * parts.goAcc + 0.15 * parts.adapt;
      break;
    }
    case 'digit': {
      const start = Number(lv.startSpan) || 3;
      const span = Number(m.maxSpan) || start;
      parts.span = clamp01((span - start) / Math.max(1, 7 - start));
      parts.acc = accuracy;
      score = 0.70 * parts.span + 0.30 * parts.acc;
      break;
    }
    case 'search': {
      parts.acc = accuracy;
      parts.rt = norm(avgRt, lv.rtGood, lv.rtBad);
      score = 0.55 * parts.acc + 0.45 * parts.rt;
      break;
    }
    case 'nback': {
      parts.dprime = clamp01(Number(m.dprime) || 0);
      parts.rt = norm(avgRt, lv.rtGood, lv.rtBad);
      score = 0.60 * parts.dprime + 0.40 * parts.rt;
      break;
    }
    case 'water': {
      parts.eff = clamp01(Number(m.stepEff) || 0);
      parts.stab = clamp01(1 - (Number(m.undo) || 0) * 0.1);
      score = 0.70 * parts.eff + 0.30 * parts.stab;
      break;
    }
    case 'pitch': {
      const startGap = Number(lv.startGap) || 7;
      const minGap = Number(lv.minGap) || 1;
      const got = Number(m.minGapSolved) || startGap;
      const room = Math.max(0.1, startGap - minGap);
      parts.threshold = clamp01((startGap - got) / room);
      parts.acc = accuracy;
      score = 0.75 * parts.threshold + 0.25 * parts.acc;
      break;
    }
    case 'track': {
      parts.acc = m.acc === undefined || m.acc === null ? accuracy : clamp01(Number(m.acc) || 0);
      parts.rt = norm(avgRt, lv.rtGood, lv.rtBad);
      parts.keep = clamp01(1 - (Number(m.lost) || 0) * 0.2);
      score = 0.70 * parts.acc + 0.20 * parts.rt + 0.10 * parts.keep;
      break;
    }
    case 'space': {
      const start = Number(lv.startLen) || 3;
      const len = Number(m.maxLen) || start;
      parts.span = clamp01((len - start) / Math.max(1, 7 - start));
      parts.acc = accuracy;
      score = 0.70 * parts.span + 0.30 * parts.acc;
      break;
    }
    default:
      return { score: 0, accuracy, parts: {} };
  }

  if (!isFinite(score)) score = 0;
  return {
    score: Math.round(clamp(score * 100, 0, 100)),
    accuracy: Math.round(accuracy * 1000) / 1000,
    parts,
  };
}

function ratingOf(score) {
  if (score >= 85) return 'excellent';
  if (score >= 60) return 'steady';
  return 'retry';
}

const RATING_TEXT = { excellent: '很棒', steady: '稳稳的', retry: '下次会更好' };

function dimsOf(gameId, score) {
  const g = HC.meta.GAME_MAP[gameId];
  if (!g) return {};
  const out = {};
  Object.keys(g.dims).forEach((k) => { if (g.dims[k] > 0) out[k] = Math.round(score); });
  return out;
}

function gradeOf(avg) {
  if (avg >= 90) return 'S';
  if (avg >= 85) return 'A+';
  if (avg >= 78) return 'A';
  if (avg >= 70) return 'B+';
  if (avg >= 60) return 'B';
  return 'C';
}

function stabilityOf(records) {
  const samples = (records || []).filter((r) => r && r.avgRt > 0 && isFinite(r.rtSd)).slice(0, 8);
  if (!samples.length) return null;
  let sum = 0, weight = 0;
  samples.forEach((r, i) => {
    const w = 1 - i * 0.08;
    sum += cvOf(r.avgRt, r.rtSd) * w;
    weight += w;
  });
  const cv = weight ? sum / weight : 0;
  const value = Math.round(clamp(100 - cv * 150, 0, 100));
  let label = '波动明显';
  if (value >= 80) label = '反应很稳';
  else if (value >= 60) label = '轻微波动';
  return { value, cv: Math.round(cv * 100) / 100, label };
}

HC.score = { clamp, norm, clamp01, cvOf, scoreOf, ratingOf, RATING_TEXT, dimsOf, gradeOf, stabilityOf };

/**
 * 健康空间站 · 本地存储（localStorage，不上云）
 * 移植自原小程序 store.js：记录缓存 / 上次玩的 / 设置 / 晋级连击。
 */
window.HC = window.HC || {};

const K = {
  RECORDS: 'hc_focus_v1_records',
  LAST: 'hc_focus_v1_last',
  SETTINGS: 'hc_focus_v1_settings',
};
const MAX_RECORDS = 200;
const DEFAULT_SETTINGS = { sound: true, haptic: true, streak: {} };

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    if (v === null || v === undefined) return fallback;
    return JSON.parse(v);
  } catch (e) { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
}
function uid() {
  return 'r_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function readRecords() {
  const v = read(K.RECORDS, []);
  return Array.isArray(v) ? v : [];
}
function appendRecord(rec) {
  if (!rec) return readRecords();
  const list = readRecords();
  list.unshift(rec);
  write(K.RECORDS, list.slice(0, MAX_RECORDS));
  return list;
}
function clearRecords() { write(K.RECORDS, []); }
function getLast() {
  const v = read(K.LAST, null);
  return v && v.gameId ? v : null;
}
function setLast(gameId, levelId) { return write(K.LAST, { gameId, levelId, at: Date.now() }); }

function getSettings() {
  const v = read(K.SETTINGS, {});
  return Object.assign({}, DEFAULT_SETTINGS, v && typeof v === 'object' ? v : {});
}
function setSettings(patch) {
  const next = Object.assign({}, getSettings(), patch || {});
  write(K.SETTINGS, next);
  return next;
}
function bumpStreak(gameId, kind) {
  const s = getSettings();
  const streak = Object.assign({}, s.streak || {});
  const cur = Object.assign({ up: 0, down: 0 }, streak[gameId] || {});
  if (kind === 'excellent') { cur.up += 1; cur.down = 0; }
  else if (kind === 'retry') { cur.down += 1; cur.up = 0; }
  else { /* steady 不动连击 */ }
  streak[gameId] = cur;
  setSettings({ streak });
  return cur;
}

HC.store = { readRecords, appendRecord, clearRecords, getLast, setLast, getSettings, setSettings, bumpStreak, uid, KEYS: K };

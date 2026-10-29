/**
 * 健康空间站 · 专注力训练
 * 游戏元数据（唯一出口）
 * 移植自原微信小程序「健脑乐园专注力训练」，H5 端用 emoji 代替 TDesign 图标。
 */
window.HC = window.HC || {};

/** 五维能力：key 顺序即雷达图顺序 */
const DIMS = [
  { key: 'sustain', name: '持续专注', desc: '长时间保持注意不掉线' },
  { key: 'memory', name: '工作记忆', desc: '边记边用，短时存储与更新' },
  { key: 'visual', name: '视觉搜索', desc: '在杂乱信息里快速定位' },
  { key: 'control', name: '反应控制', desc: '想动之前先看一眼，忍住不该动的' },
  { key: 'speed', name: '执行速度', desc: '从看到到做出反应的速度' },
];

const LEVEL_NAMES = { easy: '简单', medium: '中等', hard: '困难' };

const GAMES = [
  { id: 'schulte', name: '舒尔特方格', short: '舒尔特', emoji: '🔢', color: '#FF6B2C', bg: '#FFF1E9', tagline: '按顺序找数字', dims: { sustain: 0.40, visual: 0.40, speed: 0.20 }, online: true },
  { id: 'cancel', name: '数字划消', short: '划消', emoji: '🧹', color: '#2E86DE', bg: '#EAF2FD', tagline: '把目标数字全划掉', dims: { sustain: 0.45, visual: 0.30, control: 0.25 }, online: true },
  { id: 'match', name: '翻牌配对', short: '翻牌', emoji: '🃏', color: '#8E44AD', bg: '#F4ECFA', tagline: '翻开卡片找相同', dims: { memory: 0.55, visual: 0.20, speed: 0.25 }, online: true },
  { id: 'trail', name: '连线游戏', short: '连线', emoji: '🔗', color: '#16A085', bg: '#E7F6F2', tagline: '按顺序连成一条线', dims: { visual: 0.30, control: 0.30, speed: 0.40 }, online: true },
  { id: 'diff', name: '找不同', short: '找不同', emoji: '🔍', color: '#E67E22', bg: '#FDF2E7', tagline: '两幅图里找出不一样', dims: { sustain: 0.30, visual: 0.50, control: 0.20 }, online: true },
  { id: 'stroop', name: '颜色判断', short: '颜色', emoji: '🎨', color: '#D64545', bg: '#FDECEC', tagline: '只看颜色，不读字', dims: { sustain: 0.20, control: 0.50, speed: 0.30 }, online: true },
  { id: 'gonogo', name: '红灯停绿灯行', short: '红灯绿灯', emoji: '🚦', color: '#27AE60', bg: '#E9F8EE', tagline: '绿灯快点，红灯忍住', dims: { sustain: 0.20, control: 0.55, speed: 0.25 }, online: true },
  { id: 'digit', name: '数字记忆', short: '数字', emoji: '🔢', color: '#3B6FD4', bg: '#EBF0FC', tagline: '记住一串数字再复述', dims: { sustain: 0.30, memory: 0.70 }, online: true },
  { id: 'search', name: '视觉搜索', short: '搜索', emoji: '👁️', color: '#0E8F8F', bg: '#E6F5F5', tagline: '在格子里找出目标', dims: { sustain: 0.30, visual: 0.50, speed: 0.20 }, online: true },
  { id: 'nback', name: '记忆更新', short: '记忆更新', emoji: '🔄', color: '#7D5AE0', bg: '#F1EDFC', tagline: '和前面那个一样吗', dims: { sustain: 0.25, memory: 0.60, control: 0.15 }, online: true },
  { id: 'water', name: '颜色归位', short: '归位', emoji: '🧪', color: '#0F9D58', bg: '#E8F6ED', tagline: '把同色块倒进一瓶', dims: { memory: 0.40, control: 0.30, speed: 0.30 }, online: true },
  { id: 'pitch', name: '音高判断', short: '音高', emoji: '🎵', color: '#B45309', bg: '#FBF0E3', tagline: '听两个音，哪个更高', dims: { sustain: 0.20, memory: 0.35, control: 0.45 }, online: true },
  { id: 'track', name: '目标追踪', short: '追踪', emoji: '🎯', color: '#C2185B', bg: '#FCECF2', tagline: '盯住会动的球', dims: { sustain: 0.45, visual: 0.30, control: 0.25 }, online: true },
  { id: 'space', name: '空间记忆', short: '空间记忆', emoji: '🧠', color: '#5B6FFF', bg: '#ECEFFF', tagline: '记住亮起的顺序', dims: { sustain: 0.30, memory: 0.55, speed: 0.15 }, online: true },
];

const GAME_MAP = GAMES.reduce((acc, g) => { acc[g.id] = g; return acc; }, {});

HC.meta = { DIMS, LEVEL_NAMES, GAMES, GAME_MAP };

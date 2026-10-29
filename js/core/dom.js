/** 极简 DOM 助手 */
window.HC = window.HC || {};
HC.el = function (tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
HC.clear = function (node) { while (node && node.firstChild) node.removeChild(node.firstChild); };
HC.rndInt = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
HC.shuffle = function (arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
};

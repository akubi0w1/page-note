/**
 * fontawesomeで使うアイコンを作る
 * @param {String} className 
 * @return {HTMLElement}
 */
export function createIconElement(className) {
  let elem = document.createElement("i");
  elem.className = className;
  return elem;
};
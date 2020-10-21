import { MESSAGE_TYPE } from "./constant";

/**
 * runtimeにmessageを送る
 * @param {MESSAGE_TYPE} type 
 * @param {Object} payload 
 */
export function chromeSendMessage(type, payload={}) {
  chrome.runtime.sendMessage({
    type,
    payload
  });
}

/**
 * ファイルダウンロード
 * @param {String} filename 
 * @param {String} data 
 * @param {String} blobType 
 */
export function downloadFile(filename, data, blobType="plain/text") {
  const blob = new Blob([JSON.stringify(data)], { type: blobType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.download = filename;
  a.href = url;
  a.click();
  a.remove();
}

/**
 * 同階層にある同名の要素におけるインデックスを取得
 * 
 * @param {Element} elem 
 * @param {String} name 
 * @return {Number} 1 - N
 */
function getSiblingElementsIndex(elem, name) {
  let index = 1;
  let sib = elem;

  while((sib = sib.previousElementSibling)) {
    if(sib.nodeName.toLowerCase()===name){
      ++index;
    }
  }
  return index;
}

/**
 * 指定されたdom要素のセレクタを取得
 * 
 * @param {Element} elem 
 * @return {Array} セレクタ名の配列
 */
export function getSelectorFromElement(elem) {
  let names = [];
  if(!(elem instanceof Element)) { return names; }
  while(elem.nodeType === Node.ELEMENT_NODE) {
    let name = elem.nodeName.toLowerCase();
    if(elem.id) {
      name += "#" + elem.id;
      names.unshift(name);
      break;
    }

    let index = getSiblingElementsIndex(elem, name);
    if (1 < index) {
      name += `:nth-of-type(${index})`;
    }
    names.unshift(name);
    elem = elem.parentNode;
  }
  return names;
}
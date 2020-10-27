import { MESSAGE_TYPE, LABEL_COLOR_CODE, HIGHLIGHT_COLOR_CODE } from "./constant";

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


/**
 * 検索でヒットするか(or検索)
 * @param {Object} note 
 * @param {Array<String>} keywords 
 * @param {Object} option 
 * @param {Boolean} option.summary
 * @param {Boolean} option.body
 * @param {Boolean} option.tags
 * @param {Boolean} option.selectedText
 * @param {Boolean} option.url
 * @param {Boolean} option.title
 * @return {Boolean}
 */
export function isHitToSearchNote(note, keywords, option = {}) {
  const _option = {
    summary: typeof option.summary === "boolean" ? option.summary : true,
    body: typeof option.body === "boolean" ? option.body : true,
    tags: typeof option.tags === "boolean" ? option.tags : true,
    selectedText: typeof option.selectedText === "boolean" ? option.selectedText : true,
    url: typeof option.url === "boolean" ? option.url : true,
    title: typeof option.title === "boolean" ? option.title : true
  };

  // summary
  if (_option.summary) {
    if (keywords.filter(keyword => note.summary.indexOf(keyword) > -1).length > 0) return true;
  }

  // body
  if (_option.body) {
    if (keywords.filter(keyword => note.body.indexOf(keyword) > -1).length > 0) return true;
  }

  // tags
  if (_option.tags) {
    if (keywords.filter(keyword => typeof note.tags.find(tag => tag === keyword) !== "undefined").length > 0) return true;
  }

  // selected text
  if (_option.selectedText) {
    if (keywords.filter(keyword => note.selectedText.indexOf(keyword) > -1).length > 0) return true;
  }

  // page url
  if (_option.url) {
    if (keywords.filter(keyword => note.url.indexOf(keyword) > -1).length > 0) return true;
  }

  // page title
  if (_option.title) {
    if (keywords.filter(keyword => note.title.indexOf(keyword) > -1).length > 0) return true;
  }

  // TODO: label?


  return false;

}

/**
 * ラベルのカラーコードを取得
 * @param {LABEL_COLOR} color 
 * @return {LABEL_COLOR_CODE}
 */
export function getColorCodeForLabel(color) {
  switch(color) {
    case "red":
      return LABEL_COLOR_CODE.RED;
    case "purple":
      return LABEL_COLOR_CODE.PURPLE;
    case "blue":
      return LABEL_COLOR_CODE.BLUE;
    case "green":
      return LABEL_COLOR_CODE.GREEN;
    case "orange":
      return LABEL_COLOR_CODE.ORANGE;
    default:
      return LABEL_COLOR_CODE.DEFALULT;
  };
}

/**
 * ハイライト用のカラーコードを取得
 * @param {LABEL_COLOR} color 
 * @return {HIGHLIGHT_COLOR_CODE}
 */
export function getColorCodeForHighlight(color) {
  switch (color) {
    case "red":
      return HIGHLIGHT_COLOR_CODE.RED;
    case "purple":
      return HIGHLIGHT_COLOR_CODE.PURPLE;
    case "blue":
      return HIGHLIGHT_COLOR_CODE.BLUE;
    case "green":
      return HIGHLIGHT_COLOR_CODE.GREEN;
    case "orange":
      return HIGHLIGHT_COLOR_CODE.ORANGE;
    default:
      return HIGHLIGHT_COLOR_CODE.DEFALULT;
  };
}
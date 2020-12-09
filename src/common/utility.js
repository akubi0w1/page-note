import { MESSAGE_TYPE, LABEL_COLOR_CODE, HIGHLIGHT_COLOR_CODE, LABEL_COLOR } from "./constant";

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
  let _option = {
    summary: typeof option.summary === "boolean" ? option.summary : true,
    body: typeof option.body === "boolean" ? option.body : true,
    tags: typeof option.tags === "boolean" ? option.tags : true,
    selectedText: typeof option.selectedText === "boolean" ? option.selectedText : true,
    url: typeof option.url === "boolean" ? option.url : true,
    title: typeof option.title === "boolean" ? option.title : true,
    label: typeof option.label === "boolean" ? option.label : true
  };
  return keywords.some(keyword => {
    let _keyword = keyword;
    let _optionIdx = keyword.lastIndexOf(":");
    if (_optionIdx > -1) {
      switch (keyword.substr(_optionIdx + 1)) {
        case "summary":
          _option.body = false;
          _option.tags = false;
          _option.selectedText = false;
          _option.url = false;
          _option.title = false;
          _option.label = false;
          break;
        case "body":
          _option.summary = false;
          _option.tags = false;
          _option.selectedText = false;
          _option.url = false;
          _option.title = false;
          _option.label = false;
          break;
        case "tag":
          _option.summary = false;
          _option.body = false;
          _option.selectedText = false;
          _option.url = false;
          _option.title = false;
          _option.label = false;
          break;
        case "selectedText":
          _option.summary = false;
          _option.body = false;
          _option.tags = false;
          _option.url = false;
          _option.title = false;
          _option.label = false;
          break;
        case "url":
          _option.summary = false;
          _option.body = false;
          _option.tags = false;
          _option.selectedText = false;
          _option.title = false;
          _option.label = false;
          break;
        case "title":
          _option.summary = false;
          _option.body = false;
          _option.tags = false;
          _option.selectedText = false;
          _option.url = false;
          _option.label = false;
          break;
        case "label":
          _option.summary = false;
          _option.body = false;
          _option.tags = false;
          _option.selectedText = false;
          _option.url = false;
          _option.title = false;
          break;
      }
      _keyword = keyword.substr(0, _optionIdx);
    }
    
    // search
    if (_option.summary) {
      if (note.summary.indexOf(_keyword) > -1) {
        return true;
      }
    }
    if (_option.body) {
      if (note.body.indexOf(_keyword) > -1) {
        return true;
      }
    }
    if (_option.tags) {
      if (typeof note.tags.find(tag => tag === _keyword) !== "undefined") {
        return true;
      }
    }
    if (_option.selectedText) {
      if (note.selectedText.indexOf(_keyword) > -1) {
        return true;
      }
    }
    if (_option.url) {
      if (note.url.indexOf(_keyword) > -1) {
        return true;
      }
    }
    if (_option.title) {
      if (note.title.indexOf(_keyword) > -1) {
        return true;
      }
    }
    if (_option.label) {
      if (note.label === _keyword) {
        return true;
      }
    }
    return false;
  });
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

/**
 * 自動要約の文章数を計算する
 * @param {String} text 
 * @param {String} separator 
 * @param {Number} percentage 0 to 1
 * @returns {Number}
 */
export function calcLineNumberForSummarization(text, separator, percentage) {
  const sentenceCount = text
    .split(separator)
    .filter(sentence => sentence !== "")
    .length;
  let lineNumber = parseInt(sentenceCount * percentage);
  if (sentenceCount === lineNumber) {
    lineNumber -= 1;
  }
  if (lineNumber === 0) {
    lineNumber = 1;
  }
  return lineNumber;
}
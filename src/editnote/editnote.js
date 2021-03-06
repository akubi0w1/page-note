import { LABEL_COLOR, MESSAGE_TYPE, DEFAULT_OPTION } from "../common/constant";
import { validateNoteSummary, validateNoteBody, validateTag, validateLabel } from "../common/validation";
import { autoSummarization, calcLineNumberForSummarization, chromeSendMessage } from "../common/utility";
import { restoreOption } from "../options/options";

(function(){
  /**
   * headerのリスナーを登録
   */
  document.getElementById("header-logo").onclick = function () {
    chrome.tabs.getCurrent(function (tab) {
      chrome.tabs.update(tab.id, { url: "src/notelist/index.html" });
    });
  };

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    switch (msg.type) {
      case MESSAGE_TYPE.GET_NOTE_BY_ID_RESPONSE:
        const oldNote = msg.payload;
        if (typeof oldNote === "undefined") {
          alert("id is invalid");
          chrome.tabs.getCurrent(function (tab) {
            chrome.tabs.update(tab.id, { url: "src/notelist/index.html" });
          });
        }
        renderInfomation(oldNote);
        injectValue(oldNote);

        document.getElementById("edit-note-save").onclick = function (event) {
          event.preventDefault();
          let errorStack = [];

          const form = document.getElementById("edit-note");
          const summaryValue = form.summary.value;
          try {
            validateNoteSummary(summaryValue);
          } catch (err) {
            errorStack.push(err.message);
          }

          const bodyValue = form.body.value;
          try {
            validateNoteBody(bodyValue);
          } catch (err) {
            errorStack.push(err.message);
          }

          const tagsList = form.tags.value
            .split(",")
            .map(tag => tag.replace(/^\s+|\s+$/g, ""))
            .filter((v, i, a) => a.indexOf(v) === i)
            .filter(tag => {
              try {
                validateTag(tag);
                return true;
              } catch (err) {
                return false;
              }
            });

          const labelValue = form.labelColor.value;
          try {
            validateLabel(labelValue);
          } catch (err) {
            errorStack.push(err.message);
          }

          // handle error
          if (errorStack.length > 0) {
            clearNotify("notify");
            document.getElementById("notify").appendChild(createNotifyBarElement(errorStack, "error"));
            return;
          }

          // send update request to background
          chromeSendMessage(
            MESSAGE_TYPE.UPDATE_NOTE_BY_ID,
            {
              id: id,
              url: oldNote.url,
              selector: oldNote.selector,
              title: oldNote.title,
              selectedText: oldNote.selectedText,
              summary: summaryValue,
              body: bodyValue,
              tags: tagsList,
              label: labelValue
            }
          );
          // notify success to send request
          clearNotify("notify");
          document.getElementById("notify").appendChild(createNotifyBarElement(["success: send request"], "success"));
        };
        break;
      case MESSAGE_TYPE.AUTO_SUMMARIZATION_RESPONSE:
        const form = document.getElementById("edit-note");
        if (msg.payload.status === "success") {
          form.body.value = msg.payload.text;
        } else {
          document.getElementById("notify").appendChild(createNotifyBarElement([msg.payload.text], "error"));
        }
        form.body.readOnly = false;
        break;
    }
  });

  /**
   * 最新の値を取得
   */
  const idQuery = divideQuery(location.search.substr(1))
    .find(query => query.key === "id");

  if (typeof idQuery === "undefined") {
    alert("can't find id in query");
    chrome.tabs.getCurrent(function (tab) {
      chrome.tabs.update(tab.id, { url: "src/notelist/index.html" });
    });
    return;
  };

  const id = parseInt(idQuery.value, 10);
  if (isNaN(id)) {
    alert("id is invalid");
    chrome.tabs.getCurrent(function (tab) {
      chrome.tabs.update(tab.id, { url: "src/notelist/index.html" });
    });
    return;
  }

  /**
   * summarizationのイベントを追加
   */
  document.getElementById("summarization-btn").addEventListener("click", function() {
    const form = document.getElementById("edit-note");
    clearNotify("notify");
    restoreOption(
      { summarizationSeparator: DEFAULT_OPTION.summarizationSeparator, summarizationPercentage: DEFAULT_OPTION.summarizationPercentage },
      function(result) {
        form.body.readOnly = true;
        const lineNumber = calcLineNumberForSummarization(form.body.value, result.summarizationSeparator, result.summarizationPercentage);
        chromeSendMessage(MESSAGE_TYPE.AUTO_SUMMARIZATION, {text: form.body.value, lineNumber: lineNumber, separator: result.summarizationSeparator});
      }
    );
  });

  // get data request
  chromeSendMessage(MESSAGE_TYPE.GET_NOTE_BY_ID, { id });
}());

/**
 * 通知欄を初期化
 * @param {String} targetElemId 
 */
function clearNotify(targetElemId) {
  let targetElem = document.getElementById(targetElemId);
  if (typeof targetElem === "undefined") { return; }
  let clone = targetElem.cloneNode(false);
  targetElem.parentNode.replaceChild(clone, targetElem);
}

/**
 * 通知欄に通知を差し込む
 * @param {Array<String>} notifyList stringの配列
 * @param {String} type error | success
 */
function createNotifyBarElement(notifyList, type) {
  let barElem = document.createElement("div");
  barElem.className = "notify-bar notify-bar-wide notify-bar-" + type;
  let ulElem = document.createElement("ul");
  notifyList.forEach(err => {
    let liElem = document.createElement("li");
    liElem.innerText = err;
    ulElem.appendChild(liElem);
  });
  barElem.appendChild(ulElem);
  return barElem;
}


/**
 * infomation部分の描画
 * @param {Object} note
 * @param {Object} note.id
 * @param {String} note.url
 * @param {String} note.title
 * @param {String} note.label
 * @param {String} note.summary
 * @param {String} note.body
 * @param {String} note.selectedText
 * @param {String} note.inlineDom
 * @param {Array} note.tags
 */
function renderInfomation(note) {
  var targetElem = document.getElementById("note-infomation");
  // id
  var idRow = document.createElement("tr");
  var idKey = document.createElement("td");
  idKey.innerText = "ID";
  var idValue = document.createElement("td");
  idValue.innerText = note.id;
  idRow.appendChild(idKey);
  idRow.appendChild(idValue);

  // origin
  var originRow = document.createElement("tr");
  var originKey = document.createElement("td");
  originKey.innerText = "Origin";
  var originValue = document.createElement("td");
  originValue.innerHTML = `<a href="${note.url}" target="_blank">${note.title}</a>`;
  originRow.appendChild(originKey);
  originRow.appendChild(originValue);

  // innertext
  var selectedTextRow = document.createElement("tr");
  var selectedTextKey = document.createElement("td");
  selectedTextKey.innerText = "selected text";
  var selectedTextValue = document.createElement("td");
  selectedTextValue.innerText = note.selectedText;
  selectedTextRow.appendChild(selectedTextKey);
  selectedTextRow.appendChild(selectedTextValue);

  targetElem.appendChild(idRow);
  targetElem.appendChild(originRow);
  targetElem.appendChild(selectedTextRow);
}

/**
 * 編集だった場合に、元の値の挿入
 * 
 * @param {Object} note
 * @param {Object} note.id
 * @param {String} note.url
 * @param {String} note.title
 * @param {String} note.label
 * @param {String} note.summary
 * @param {String} note.body
 * @param {String} note.selectedText
 * @param {String} note.inlineDom
 * @param {Array} note.tags
 */
function injectValue(note) {
  var form = document.getElementById("edit-note");

  // label
  document.getElementById("label-color-" + note.label).checked = true;

  // sumamry
  form.summary.value = note.summary;

  // body
  form.body.value = note.body;

  // tags
  form.tags.value = note.tags;
}


/**
 *  * クエリをオブジェクトの配列に変換
 * id=1&name=amy -> [{key: id, value: 1 }, { key: name, value: "amy" }]
 * 
 * @param {String} queryString 
 */
function divideQuery(queryString) {
  return queryString.split("&").map(item => {
    var pair = item.split("=");
    return {
      key: pair[0],
      value: pair[1]
    };
  });
}
import { LABEL_COLOR_CODE, MESSAGE_TYPE, OPTION_KEY } from "../common/constant";
import { createIconElement } from "../common/element";
import { chromeSendMessage, isHitToSearchNote, getColorCodeForLabel } from "../common/utility";
import { saveOptions, getOptionsByKey, restoreOption } from "../common/options";

/**
 * 初期処理
 */
(function() {  
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    switch (msg.type) {
      case MESSAGE_TYPE.GET_ALL_NOTE_RESPONSE:
      case MESSAGE_TYPE.GET_NOTE_BY_URL_RESPONSE:
        clearNoteList();
        let noteList = msg.payload;
        /**
         * 検索のイベントリスナー
         */
        const searchButton = document.getElementById("search-bar-submit");
        searchButton.addEventListener("click", evt => {
          event.preventDefault();
          let form = document.getElementById("search-bar-form");
          let keywords = form.keyword.value
            .split(" ")
            .filter(keyword => keyword !== "");
          if (!keywords.length) {
            clearNoteList();
            renderNoteList(noteList);
            return;
          }
          clearNoteList();
          renderNoteList(noteList.filter(note => isHitToSearchNote(note, keywords)));
          return;
        });
        renderNoteList(noteList);
        break;
    }
  });

  addEventListenerToTabMenu();
  restoreOption(OPTION_KEY.MARK_TEXT, function (result) {
    let switchHighlightElem = document.getElementById("popup-setting-switch-highlight");
    let switchElem = switchHighlightElem.nextElementSibling;
    if (result.markText) {
      switchElem.className = "setting-switch checked";
      switchElem.innerText = "on";
    } else {
      switchElem.className = "setting-switch";
      switchElem.innerText = "off";
    }
  });
  chromeSendMessage(MESSAGE_TYPE.GET_ALL_NOTE);
  
})();

/**
 * 
 * @param {Array} notes 
 */
function renderNoteList(notes) {
  let noteListElement = document.getElementsByClassName("note-list")[0];
  notes.forEach(note => {
    noteListElement.appendChild(createNoteItemElement(note));
  });
}

/**
 * note listの中身を空にする
 */
function clearNoteList() {
  let noteListElem = document.getElementsByClassName("note-list")[0];
  var clone = noteListElem.cloneNode(false);
  noteListElem.parentNode.replaceChild(clone, noteListElem);
}


/**
 * 
 * @param {Object} note 
 * @param {Number} note.id
 * @param {String} note.title
 * @param {String} note.url
 * @param {String} note.selector
 * @param {String} note.selectedText
 * @param {String} note.summary
 * @param {String} note.body
 * @param {String} note.label
 * @param {Array} note.tags
 * @return {HTMLLIElement}
 */
function createNoteItemElement(note) {
  let noteItemElement = document.createElement("li");
  noteItemElement.className = "note-item";

  let noteContent = createNoteContentElement(note.summary, note.body, note.url, note.tags);
  let noteLabel = createNoteLabelElement(note.label);

  noteItemElement.appendChild(noteContent);
  noteItemElement.appendChild(noteLabel);
  return noteItemElement;
}


/**
 * 
 * @param {String} summary 
 * @param {String} body
 * @param {String} url
 * @param {Array} tags
 * @return {HTMLDivElement}
 */
function createNoteContentElement(summary, body, url, tags) {
  let noteContent = document.createElement("div");
  noteContent.className = "note-content";
  
  let frame = createNoteFrameElement(summary, body, url, tags);
  let extendSwitch = createExtendSwitchElement();

  noteContent.appendChild(frame);
  noteContent.appendChild(extendSwitch);
  return noteContent;
}

/**
 * 
 * @param {String} summary 
 * @param {String} body
 * @param {String} url
 * @param {Array} tags
 * @return {HTMLDivElement}
 */
function createNoteFrameElement(summary, body, url, tags) {
  let frame = document.createElement("div");
  frame.style = "padding: 10px 20px 5px;";

  let summaryElement = document.createElement("label");
  summaryElement.className = "note-title";
  summaryElement.textContent = summary;

  frame.appendChild(summaryElement);
  frame.appendChild(createNoteBodyElement(body, url, tags));
  return frame;
}

/**
 * 
 * @param {String} body
 * @param {String} url
 * @param {Array<String>} tags
 * @return {HTMLDivElement}
 */
function createNoteBodyElement(body, url, tags) {

  let noteBody = document.createElement("div");
  noteBody.innerText = body;

  let bodyElement = document.createElement("div");
  bodyElement.className = "note-body hidden";
  
  bodyElement.appendChild(noteBody);
  bodyElement.appendChild(createNoteFooterElement(url, tags));
  
  return bodyElement;
}

/**
 * ノートのフッターを作成
 * @param {String} url 
 * @param {Array<String>} tags 
 * @return {HTMLDivElement}
 */
function createNoteFooterElement(url, tags) {
  let footerElem = document.createElement("div");
  footerElem.className = "note-footer";

  let tagList = document.createElement("ul");
  tagList.className = "note-tag-list al-right";
  tags.map(tag => {
    let item = document.createElement("li");
    item.innerText = tag;
    tagList.appendChild(item);
  });

  let control = document.createElement("ul");
  control.className = "control";
  control.innerHTML = `
  <li>
    <a href="${url}" target="_blank"><i class="fas fa-external-link-alt"></i></a>
  </li>
  `;

  footerElem.appendChild(tagList);
  footerElem.appendChild(control);
  return footerElem;

}

/**
 * ノートの詳細見るためのスイッチ
 * @return {HTMLDivElement}
 */
function createExtendSwitchElement() {
  let extendSwitch = document.createElement("div");
  extendSwitch.className = "note-switch";
  extendSwitch.appendChild(createIconElement("fas fa-caret-down fa-lg"));
  
  extendSwitch.onclick = function () {
    let switchElem = this;
    let target = this.parentElement.getElementsByClassName("note-body")[0];
    if (target.className.indexOf("hidden") > 0) {
      target.className = "note-body";
      switchElem.children[0].className = "fas fa-caret-up fa-lg";
    } else {
      target.className = "note-body hidden";
      switchElem.children[0].className = "fas fa-caret-down fa-lg";
    }
  };

  return extendSwitch;
}

/**
 * ノート1つのラベル
 * @param {String} color
 * @return {HTMLDivElement}
 */
function createNoteLabelElement(color) {
  let labelElement = document.createElement("div");
  labelElement.className = "note-label";
  labelElement.style = `background-color: ${getColorCodeForLabel(color)}`;
  return labelElement;
}

/**
 * tab menuに関して処理を追加
 */
function addEventListenerToTabMenu() {
  let labelElems = document.getElementsByClassName("tab-item");

  // TODO: 効率化！！！

  let allNoteButton = document.getElementById("popup-tab-all-note");
  allNoteButton.addEventListener("click", function () {
    showNoteList();
    hideSettingList();
    chromeSendMessage(MESSAGE_TYPE.GET_ALL_NOTE);
    for (let i = 0; i < labelElems.length; i++) {
      if (labelElems[i].getAttribute("for") === "popup-tab-all-note") {
        labelElems[i].className = "tab-item checked";
      } else {
        labelElems[i].className = "tab-item";
      }
    }
  });

  let currentPageButton = document.getElementById("popup-tab-current-page");
  currentPageButton.addEventListener("click", function () {
    showNoteList();
    hideSettingList();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chromeSendMessage(MESSAGE_TYPE.GET_NOTE_BY_URL, { url: tabs[0].url });
    });
    for (let i = 0; i < labelElems.length; i++) {
      if (labelElems[i].getAttribute("for") === "popup-tab-current-page") {
        labelElems[i].className = "tab-item checked";
      } else {
        labelElems[i].className = "tab-item";
      }
    }
  });

  let settingButton = document.getElementById("popup-tab-setting");
  settingButton.addEventListener("click", function () {
    hideNoteList();
    showSettingList();

    for (let i = 0; i < labelElems.length; i++) {
      if (labelElems[i].getAttribute("for") === "popup-tab-setting") {
        labelElems[i].className = "tab-item checked";
      } else {
        labelElems[i].className = "tab-item";
      }
    }
  });
  let switchHighlightElem = document.getElementById("popup-setting-switch-highlight");
  switchHighlightElem.addEventListener("change", function () {
    let switchElem = switchHighlightElem.nextElementSibling;
    if (switchElem.className.indexOf("checked") > -1) {
      switchElem.className = "setting-switch";
      switchElem.innerText = "off";
      saveOptions({ markText: false });
    } else {
      switchElem.className = "setting-switch checked";
      switchElem.innerText = "on";
      saveOptions({ markText: true });
    }
  });
}

/**
 * tab-menuのsettingを表示
 */
function showSettingList() {
  let settingListElem = document.getElementsByClassName("setting-list")[0];
  settingListElem.className = "setting-list";
}

/**
 * tab-menuのsettingを隠す
 */
function hideSettingList() {
  let settingListElem = document.getElementsByClassName("setting-list")[0];
  settingListElem.className = "setting-list hidden";
}

/**
 * tab-menuのnote-listを表示
 */
function showNoteList() {
  let noteListElem = document.getElementsByClassName("note-list")[0];
  noteListElem.className = "note-list";
}

/**
 * tab-menuのnote-listを隠す
 */
function hideNoteList() {
  let noteListElem = document.getElementsByClassName("note-list")[0];
  noteListElem.className = "note-list hidden";
}

/**
 * popupを閉じる
 */
document.getElementById("close-btn").onclick = function() {
  window.close();
};

/**
 * AddNoteのイベントを追加
 */
document.getElementById("add-note-btn").onclick = function () {
  // TODO: utilに書き出し
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: MESSAGE_TYPE.OPEN_ADD_NOTE_WINDOW, payload: {}}
    );
  });
  window.close();
};

/**
 * note管理画面へ遷移
 */
document.getElementById("open-manage-page-btn").onclick = function () {
  chrome.tabs.create({ url: "src/notelist/index.html" });
};

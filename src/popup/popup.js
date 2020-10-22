import { LABEL_COLOR_CODE, MESSAGE_TYPE } from "../common/constant";
import { createIconElement } from "../common/element";
import { chromeSendMessage, isHitToSearchNote } from "../common/utility";

/**
 * 初期処理
 */
(function() {  
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    switch (msg.type) {
      case MESSAGE_TYPE.GET_ALL_NOTE_RESPONSE:
        clearNoteList();
        const noteList = msg.payload;
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
          console.log(keywords);
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

  chromeSendMessage(MESSAGE_TYPE.GET_ALL_NOTE);
})();

/**
 * 
 * @param {Array>} notes 
 */
function renderNoteList(notes) {
  let noteListElement = document.getElementsByClassName("note-list")[0];
  notes.forEach(note => {
    noteListElement.appendChild(createNoteItemElement(note));
  });
}

/**
 * 
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
 * @param {string} note.title
 * @param {string} note.url
 * @param {string} note.selector
 * @param {string} note.selectedText
 * @param {string} note.summary
 * @param {string} note.body
 * @param {string} note.label
 * @param {Array} note.tags
 * @return {HTMLLIElement}
 */
function createNoteItemElement(note) {
  let noteItemElement = document.createElement("li");
  noteItemElement.className = "note-item";

  let noteContent = createNoteContentElement(note.summary, note.body, note.tags);
  let noteLabel = createNoteLabelElement(note.label);

  noteItemElement.appendChild(noteContent);
  noteItemElement.appendChild(noteLabel);
  return noteItemElement;
}


/**
 * 
 * @param {string} summary 
 * @param {string} body 
 * @param {Array} tags
 * @return {HTMLDivElement}
 */
function createNoteContentElement(summary, body, tags) {
  let noteContent = document.createElement("div");
  noteContent.className = "note-content";
  
  let frame = createNoteFrameElement(summary, body, tags);
  let extendSwitch = createExtendSwitchElement();

  noteContent.appendChild(frame);
  noteContent.appendChild(extendSwitch);
  return noteContent;
}

/**
 * 
 * @param {string} summary 
 * @param {string} body 
 * @param {Array} tags
 * @return {HTMLDivElement}
 */
function createNoteFrameElement(summary, body, tags) {
  let frame = document.createElement("div");
  frame.style = "padding: 10px 20px 5px;";

  let summaryElement = document.createElement("label");
  summaryElement.className = "note-title";
  summaryElement.textContent = summary;

  frame.appendChild(summaryElement);
  frame.appendChild(createNoteBodyElement(body, tags));
  return frame;
}

/**
 * 
 * @param {string} body 
 * @param {Array} tags 
 * @return {HTMLDivElement}
 */
function createNoteBodyElement(body, tags) {

  let noteBody = document.createElement("div");
  noteBody.innerText = body;

  let tagList = document.createElement("ul");
  tagList.className = "note-tag-list al-right";
  tags.map(tag => {
    let item = document.createElement("li");
    item.innerText = tag;
    tagList.appendChild(item);
  });

  let bodyElement = document.createElement("div");
  bodyElement.className = "note-body hidden";
  
  bodyElement.appendChild(noteBody);
  bodyElement.appendChild(tagList);
  
  return bodyElement;
}

/**
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
 * 
 * @param {string} color
 * @return {HTMLDivElement}
 */
function createNoteLabelElement(color) {
  let labelElement = document.createElement("div");
  labelElement.className = "note-label";
  switch(color) {
    case "red":
      labelElement.style = "background-color: " + LABEL_COLOR_CODE.RED;
      break;
    case "purple":
      labelElement.style = "background-color: " + LABEL_COLOR_CODE.PURPLE;
      break;
    case "blue":
      labelElement.style = "background-color: " + LABEL_COLOR_CODE.BLUE;
      break;
    case "green":
      labelElement.style = "background-color: " + LABEL_COLOR_CODE.GREEN;
      break;
    case "orange":
      labelElement.style = "background-color: " + LABEL_COLOR_CODE.ORANGE;
      break;
    default:
      labelElement.style = "background-color: " + LABEL_COLOR_CODE.DEFALULT;
      break;
  }
  return labelElement;
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

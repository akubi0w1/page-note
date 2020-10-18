import { RED_CODE, PURPLE_CODE, BLUE_CODE, GREEN_CODE, ORANGE_CODE } from "../common/constant";

/**
 * 初期処理
 */
(function() {
  let noteListElement = document.getElementsByClassName("note-list")[0];

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    switch (msg.type) {
      case "GET_ALL_NOTE_RESPONSE":
        msg.payload.forEach(note => {
          noteListElement.appendChild(createNoteItemElement(note));
        });
        break;
    }
  });

  chrome.runtime.sendMessage({
    type: "GET_ALL_NOTE", // TODO: constantsに切り出し
    payload: {}
  });

})();

/**
 * 
 * @param {Object} note 
 * @param {Number} note.id
 * @param {string} note.title
 * @param {string} note.url
 * @param {string} note.inlineDom
 * @param {string} note.inlineText
 * @param {string} note.summary
 * @param {string} note.body
 * @param {string} note.labelColor
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
      labelElement.style = "background-color: " + RED_CODE;
      break;
    case "purple":
      labelElement.style = "background-color: " + PURPLE_CODE;
      break;
    case "blue":
      labelElement.style = "background-color: " + BLUE_CODE;
      break;
    case "green":
      labelElement.style = "background-color: " + GREEN_CODE;
      break;
    case "orange":
      labelElement.style = "background-color: " + ORANGE_CODE;
      break;
    default:
      labelElement.style = "background-color: " + RED_CODE;
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
      { type: "OPEN_NEW_NOTE_WINDOW", payload: {}}
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


/**
 * fontawesomeで使うアイコンを作る
 * @param {string} className 
 * @return {HTMLElement}
 */
// TODO: dry
function createIconElement(className) {
  let elem = document.createElement("i");
  elem.className = className;
  return elem;
};

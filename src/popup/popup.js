// TODO: DBとかにしまえれば良いか？
const RED_CODE = "#ff389b";
const PURPLE_CODE = "#9b38ff";
const BLUE_CODE = "#389bff";
const GREEN_CODE = "#00cc33";
const ORANGE_CODE = "#ff9b38";

/**
 * 初期処理
 */
(function() {
  chrome.extension.getBackgroundPage().getAllNotes();
  let noteListElement = document.getElementsByClassName("note-list")[0];
  chrome.extension.getBackgroundPage().NOTE_LIST.forEach(note => {
    noteListElement.appendChild(createNoteItemElement(note));
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
  console.log("create note");
  let noteItemElement = document.createElement("li");
  noteItemElement.className = "note-item";

  let noteContent = createNoteContentElement(note.summary, note.body, note.tags);
  let noteLabel = createNoteLabelElement(note.labelColor);

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
    chrome.tabs.executeScript(
      tabs[0].id,
      { code: "document.getElementById(\"_page-note-wrapper\").style.display = \"block\";" }
    );
  });
  window.close();
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

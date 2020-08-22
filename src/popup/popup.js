let noteListElement = document.getElementsByClassName("note-list")[0];

const SAMPLE_NOTES = [
  {
    id: 1,
    title: "page title",
    url: "https://sample.com",
    inlineDom: "something",
    inlineText: "inline text",
    summary: "notesummary",
    body: "note detail",
    labelColor: "red",
    tags: ["tag2", "tag1"]
  },
  {
    id: 2,
    title: "page title2",
    url: "https://sample2.com",
    inlineDom: "something2",
    inlineText: "inline text2",
    summary: "notesummar2y",
    body: "note detail2",
    labelColor: "purple",
    tags: ["tag3", "tag4"]
  }
];

/**
 * 初期処理
 */
(function() {
  // TODO: dbからデータ欲しい
  SAMPLE_NOTES.forEach(note => {
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
  let noteItemElement = document.createElement("li");
  noteItemElement.className = "note-item";

  let noteContent = createNoteContentElement(note.title, note.body, note.tags);
  let noteLabel = createNoteLabelElement(note.labelColor);

  noteItemElement.appendChild(noteContent);
  noteItemElement.appendChild(noteLabel);
  return noteItemElement;
}


/**
 * 
 * @param {string} title 
 * @param {string} body 
 * @param {Array} tags
 * @return {HTMLDivElement}
 */
function createNoteContentElement(title, body, tags) {
  let noteContent = document.createElement("div");
  noteContent.className = "note-content";
  
  let frame = createNoteFrameElement(title, body, tags);
  let extendSwitch = createExtendSwitchElement();

  noteContent.appendChild(frame);
  noteContent.appendChild(extendSwitch);
  return noteContent;
}

/**
 * 
 * @param {string} title 
 * @param {string} body 
 * @param {Array} tags
 * @return {HTMLDivElement}
 */
function createNoteFrameElement(title, body, tags) {
  let frame = document.createElement("div");
  frame.style = "padding: 10px 20px 5px;";

  let titleElement = document.createElement("label");
  titleElement.className = "note-title";
  titleElement.textContent = title;

  frame.appendChild(titleElement);
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
  
  extendSwitch.onclick = function (e) {
    let switchElem = this;
    let target = this.parentElement.getElementsByClassName("note-body")[0];
    if (target.className.indexOf("hidden") > 0) {
      target.className = "note-body";
      switchElem.children[0].className = "fas fa-caret-up fa-lg";
    } else {
      target.className = "note-body hidden";
      switchElem.children[0].className = "fas fa-caret-down fa-lg";
    }
  }

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
      labelElement.style = "background-color: #ff389b"
      break
    case "purple":
      labelElement.style = "background-color: #9b38ff"
      break
    case "blue":
      labelElement.style = "background-color: #389bff"
      break
    case "green":
      labelElement.style = "background-color: #00cc33"
      break
    case "orange":
      labelElement.style = "background-color: #ff9b38"
      break
    default:
      labelElement.style = "background-color: #ff389b"
      break
  }
  return labelElement;
}

/**
 * popupを閉じる
 */
document.getElementById("close-btn").onclick = function() {
  window.close();
}

/**
 * AddNoteのイベントを追加
 */
document.getElementById("add-note-btn").onclick = function (e) {
  // TODO: 画面にnewまどを追加
};

/**
 * fontawesomeで使うアイコンを作る
 * @param {string} className 
 * @return {HTMLElement}
 */
function createIconElement(className) {
  let elem = document.createElement("i");
  elem.className = className;
  return elem;
};

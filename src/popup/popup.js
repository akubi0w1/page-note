let noteListElement = document.getElementsByClassName("note-list")[0];

/**
 * 初期処理
 */
(function() {
  // TODO: データ仕込んで
  const body = `It is a long established fact that a reader will be distracted by the readable content of a page when
  looking at its
  layout.The point of using Lorem Ipsum is that it has a more - or - less normal distribution of letters, as
  opposed to using
  'Content here, content here', making it look like readable English.Many desktop publishing packages and
  web page
  editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many
  web sites
  still in their infancy.Various versions have evolved over the years, sometimes by accident, sometimes on
  purpose
    (injected humour and the like).`
  noteListElement.appendChild(createNoteItemElement("title", body));
})();

/**
 * 
 * @param {string} title 
 * @param {string} body 
 * @return {HTMLLIElement}
 */
function createNoteItemElement(title, body) {
  let noteItemElement = document.createElement("li");
  noteItemElement.className = "note-item";

  let noteContent = createNoteContentElement(title, body);
  let noteLabel = createNoteLabelElement();

  noteItemElement.appendChild(noteContent);
  noteItemElement.appendChild(noteLabel);
  return noteItemElement;
}


/**
 * 
 * @param {string} title 
 * @param {string} body 
 * @return {HTMLDivElement}
 */
function createNoteContentElement(title, body) {
  let noteContent = document.createElement("div");
  noteContent.className = "note-content";
  
  let frame = createNoteFrameElement(title, body);
  let extendSwitch = createExtendSwitchElement();

  noteContent.appendChild(frame);
  noteContent.appendChild(extendSwitch);
  return noteContent;
}

/**
 * 
 * @param {string} title 
 * @param {string} body 
 * @return {HTMLDivElement}
 */
function createNoteFrameElement(title, body) {
  let frame = document.createElement("div");
  frame.style = "padding: 10px 20px 5px;";

  let titleElement = document.createElement("label");
  titleElement.className = "note-title";
  titleElement.textContent = title;

  let bodyElement = document.createElement("div");
  bodyElement.className = "note-body hidden";
  bodyElement.innerText = body;

  frame.appendChild(titleElement);
  frame.appendChild(bodyElement);
  return frame;
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

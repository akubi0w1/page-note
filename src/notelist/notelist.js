import { LABEL_COLOR_CODE, MESSAGE_TYPE } from "../common/constant";

(function(){
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    switch (msg.type) {
      case MESSAGE_TYPE.GET_ALL_NOTE_RESPONSE:
        clearNoteList();
        const noteList = msg.payload;
        // 検索バーのイベントリスナーを追加
        let applyBtn = document.getElementById("search-bar-form-submit");
        applyBtn.addEventListener("click", event => {
          event.preventDefault();
          let form = document.getElementById("search-bar-form");
          let keyword = form.keyword.value;
          if (keyword === "") {
            clearNoteList();
            renderNoteList(noteList);
            return;
          }

          noteList.filter(note => isHitToSearch(note, keyword));
          clearNoteList();
          renderNoteList(noteList);
          return;
        });

        // 初回描画
        renderNoteList(noteList);
        break;
    }
  });

  chrome.runtime.sendMessage({
    type: MESSAGE_TYPE.GET_ALL_NOTE,
    payload: {}
  });

})();

/**
 * 検索でヒットするか
 * @param {Object} note 
 * @param {String} keyword 
 * @param {Object} option 
 * @param {Boolean} option.summary
 * @param {Boolean} option.body
 * @param {Boolean} option.tags
 * @param {Boolean} option.selectedText
 * @param {Boolean} option.url
 * @param {Boolean} option.title
 * @return {Boolean}
 */
function isHitToSearch(note, keyword, option={}) {
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
    if (note.summary.indexOf(keyword) > -1) return true;
  }

  // body
  if (_option.body) {
    if (note.body.indexOf(keyword) > -1) return true;
  }

  // tags
  if (_option.tags) {
    if (typeof note.tags.find(tag => tag === keyword) !== "undefined") return true;
  }

  // selected text
  if (_option.selectedText) {
    if (note.inlineText.indexOf(keyword) > -1) return true;
  }

  // page url
  if (_option.url) {
    if (note.url.indexOf(keyword) > -1) return true;
  }

  // page title
  if (_option.title) {
    if (note.title.indexOf(keyword) > -1) return true;
  }

  // TODO: label?


  return false;

}

/**
 * リストを作成する
 * 
 * @param {Array<Object>} noteList 
 */
function renderNoteList(noteList) {
  let noteListElem = document.getElementById("note-list");
  noteList.forEach(note => {
    noteListElem.appendChild(createNoteListRow(note));
  });
}

/**
 * リストを吹き飛ばす
 */
function clearNoteList() {
  let noteListElem = document.getElementById("note-list");
  var clone = noteListElem.cloneNode(false);
  noteListElem.parentNode.replaceChild(clone, noteListElem);
}

/**
 * note listの一行を作成
 * 
 * @param {Object} note 
 * @param {Object} note.id
 * @param {String} note.url
 * @param {String} note.title
 * @param {String} note.label
 * @param {String} note.summary
 * @param {String} note.body
 * @param {String} note.inlineText
 * @param {String} note.inlineDom
 * @param {Array} note.tags
 * @returns {HTMLElement}
 */
function createNoteListRow(note) {
  // TODO: styleの調整
  var row = document.createElement("tr");
  
  var idCol = document.createElement("td");
  idCol.innerText = note.id;
  
  // label
  var labelCol = document.createElement("td");
  var labelBar = document.createElement("div");
  labelBar.className = "label";
  switch (note.label) {
    case "red":
      labelBar.style = "background-color: " + LABEL_COLOR_CODE.RED;
      break;
    case "blue":
      labelBar.style = "background-color: " + LABEL_COLOR_CODE.BLUE;
      break;
    case "green":
      labelBar.style = "background-color: " + LABEL_COLOR_CODE.GREEN;
      break;
    case "purple":
      labelBar.style = "background-color: " + LABEL_COLOR_CODE.PURPLE;
      break;
    case "orange":
      labelBar.style = "background-color: " + LABEL_COLOR_CODE.ORANGE;
      break;
  }
  labelCol.appendChild(labelBar);

  // origin page
  var pageCol = document.createElement("td");
  var pageLink = document.createElement("a");
  pageLink.className = "page-link";
  pageLink.href = note.url;
  pageLink.target = "_blank";
  pageLink.innerText = note.title;
  pageCol.appendChild(pageLink);

  // summary
  var summaryCol = document.createElement("td");
  summaryCol.innerText = note.summary;
  
  // body
  var bodyCol = document.createElement("td");
  bodyCol.innerText = note.body;
  
  // tags
  var tagsCol = document.createElement("td");
  tagsCol.innerText = note.tags;

  // button area
  var buttonCol = document.createElement("td");
  buttonCol.style = "min-width: 75px; font-size: 16px;";
  var editBtn = document.createElement("button");
  editBtn.className = "btn btn-accent-outline";
  editBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: `src/editnote/index.html?id=${note.id}` });
  });
  editBtn.appendChild(createIconElement("fas fa-edit"));
  var deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger-outline";
  deleteBtn.appendChild(createIconElement("fas fa-trash"));
  deleteBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE.DELETE_NOTE_BY_ID,
      payload: { id: note.id }
    });
  });
  buttonCol.appendChild(editBtn);
  buttonCol.appendChild(deleteBtn);

  row.appendChild(idCol);
  row.appendChild(labelCol);
  row.appendChild(pageCol);
  row.appendChild(summaryCol);
  row.appendChild(bodyCol);
  row.appendChild(tagsCol);
  row.appendChild(buttonCol);

  return row;
}

// TODO: dryがあああ
/**
 * fontawesomeで使うアイコンを作る
 * @param {String} className 
 * @return {HTMLElement}
 */
function createIconElement(className) {
  let elem = document.createElement("i");
  elem.className = className;
  return elem;
};
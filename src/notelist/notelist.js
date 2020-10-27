import { LABEL_COLOR_CODE, MESSAGE_TYPE } from "../common/constant";
import { createIconElement } from "../common/element";
import { chromeSendMessage, isHitToSearchNote, getColorCodeForLabel } from "../common/utility";

(function(){
  /**
   * header機能のリスナーを作成
   */
  document.getElementById("export-button").addEventListener("click", function(evt) {
    if(confirm("export indexedDB data. Are you sure download data file?")) {
      chromeSendMessage(MESSAGE_TYPE.EXPORT_INDEXEDDB);
    }
  });
  document.getElementById("import-button").addEventListener("change", function(evt) {
    const importFile = this.files[0];
    if (importFile.type !== "application/json") {
      alert("type of file isn't json.");
      return;
    }
    if (confirm(`import indexedDB data. The original data will be deleted.\nfile name is ${importFile.name}.`)) {
      const reader = new FileReader();
      reader.readAsText(importFile);
      reader.onload = function (evt) {
        chromeSendMessage(MESSAGE_TYPE.IMPORT_INDEXEDDB, JSON.parse(reader.result));
      };
    }
  });

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
          let keywords = form.keyword.value
            .split(" ")
            .filter(keyword => keyword !== "");
          if(!keywords.length) {
            clearNoteList();
            renderNoteList(noteList);
            return;
          }
          clearNoteList();
          renderNoteList(noteList.filter(note => isHitToSearchNote(note, keywords)));
          return;
        });

        // 初回描画
        renderNoteList(noteList);
        break;
    }
  });

  chromeSendMessage(MESSAGE_TYPE.GET_ALL_NOTE);

})();

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
 * @param {String} note.selectedText
 * @param {String} note.selector
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
  labelBar.style = `background-color: ${getColorCodeForLabel(note.label)}`;
  labelCol.appendChild(labelBar);

  // selectedText
  let selectedText = document.createElement("td");
  selectedText.innerText = note.selectedText;

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
    chromeSendMessage(
      MESSAGE_TYPE.DELETE_NOTE_BY_ID,
      { id: note.id }
    );
  });
  buttonCol.appendChild(editBtn);
  buttonCol.appendChild(deleteBtn);

  row.appendChild(idCol);
  row.appendChild(labelCol);
  row.appendChild(summaryCol);
  // row.appendChild(selectedText);
  row.appendChild(bodyCol);
  row.appendChild(pageCol);
  row.appendChild(tagsCol);
  row.appendChild(buttonCol);

  return row;
}
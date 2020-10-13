const RED_CODE = "#ff389b";
const PURPLE_CODE = "#9b38ff";
const BLUE_CODE = "#389bff";
const GREEN_CODE = "#00cc33";
const ORANGE_CODE = "#ff9b38";


// TODO: note-listをtargetに取得したものを突っ込む
// TODO: background scriptから全値を取得

var noteListElem = document.getElementById("note-list");

(function(){

  chrome.extension.getBackgroundPage().NOTE_LIST.forEach(note => {
    noteListElem.appendChild(createNoteListRow(note));
  });
})();


/**
 * note listの一行を作成
 * 
 * @param {Object} note 
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
  var row = document.createElement("tr");
  
  var idCol = document.createElement("td");
  
  // label
  var labelCol = document.createElement("td");
  var labelBar = document.createElement("div");
  labelBar.className = "label";
  switch (note.label) {
    case "red":
      labelBar.style = "background-color: " + RED_CODE;
      break;
    case "blue":
      labelBar.style = "background-color: " + BLUE_CODE;
      break;
    case "green":
      labelBar.style = "background-color: " + GREEN_CODE;
      break;
    case "purple":
      labelBar.style = "background-color: " + PURPLE_CODE;
      break;
    case "orange":
      labelBar.style = "background-color: " + ORANGE_CODE;
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
  editBtn.appendChild(createIconElement("fas fa-edit"));
  var deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger-outline";
  deleteBtn.appendChild(createIconElement("fas fa-trash"));
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
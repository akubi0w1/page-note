// TODO: DBから値取得
const RED_CODE = "#ff389b";
const PURPLE_CODE = "#9b38ff";
const BLUE_CODE = "#389bff";
const GREEN_CODE = "#00cc33";
const ORANGE_CODE = "#ff9b38";

let pageNoteWrapper = document.createElement("div");
pageNoteWrapper.className = "_page-note-wrapper";
pageNoteWrapper.id = "_page-note-wrapper";
// pageNoteWrapper.addEventListener("mousedown", mouseDown, false);
// 座標
// var x;
// var y;
(function() {
  // TODO: あれを作るぞ...( ˘ω˘ )

  let pageNote = document.createElement("div");
  pageNote.className = "_page-note";

  pageNote.appendChild(createHeader());
  pageNote.appendChild(createContent());

  pageNoteWrapper.appendChild(pageNote);

  document.body.appendChild(pageNoteWrapper);
})();


/**
 * 
 * @return {HTMLDivElement}
 */
function createHeader() {
  let headerItem = document.createElement("div");
  headerItem.className = "_page-note-header-item";

  // tools
  let headerTools = document.createElement("div");
  headerTools.className = "_page-note-header-tools";
  let closeButton = document.createElement("button");
  closeButton.className = "btn btn-accent";
  // TODO: fontawesomeを使いたい...
  closeButton.innerHTML = "close";
  // closeButton.appendChild(createIconElement("fas fa-times"));
  closeButton.onclick = function() {
    pageNoteWrapper.style = "display: none";
  };

  headerTools.appendChild(closeButton);
  
  let header = createElement("div", "_page-note-header");
  header.appendChild(headerItem);
  header.appendChild(headerTools);
  return header;
}

// TODO: 改良...
function createContent() {
  let form = createElement("form", "_page-note-content-form");

  // submitButton
  let submitButtonInput = createElement("div", "_page-note-content-form-item al-right ps-top-right");
  let submitButton = createElement("button", "btn btn-accent");
  submitButton.type = "submit";
  submitButton.innerText = "save";
  submitButton.onclick = function(evt) {
    evt.preventDefault();
    // TODO: url, inline_dom, inline_text, titleの取得
    var summaryValue = summaryInput.value;
    var bodyValue = bodyInput.value;
    var tagsValue = tagsInput.value; // TODO: 切り離しandリストに
    var labelValue = labelInput.value; // TODO: とれてない
    chrome.runtime.sendMessage({
      type: "ADD_NOTE", // TODO: constantsに切り出し
      payload: {
        url: "",
        inlineDom: "",
        inlineText: "",
        title: "",
        summary: summaryValue,
        body: bodyValue,
        tags: [],
        label: labelValue
      }
    });
  }
  submitButtonInput.appendChild(submitButton);

  // labelColor
  let colorList = [{ label: "red", code: RED_CODE, checked: true }, { label: "purple", code: PURPLE_CODE, checked: false }, { label: "blue", code: BLUE_CODE, checked: false }, { label: "green", code: GREEN_CODE, checked: false }, { label: "orange", code: ORANGE_CODE, checked: false }];
  let labelInput = createElement("div", "_page-note-content-form-item");
  let labelFrame = document.createElement("div");
  labelFrame.style = "display: flex; align-items: center;";
  colorList.forEach(item => {
    let input = createElement("input", "_page-note-content-form-input-radio");
    input.id = "_page-note-label-color-" + item.label;
    input.type = "radio";
    input.name = "labelColor";
    input.value = item.label;
    input.checked = item.checked;
    let label = createElement("label", "_page-note-content-form-color-label");
    label.setAttribute("for", "_page-note-label-color-" + item.label );
    label.style = "background-color: " + item.code;
    labelFrame.appendChild(input);
    labelFrame.appendChild(label);
  });
  labelInput.appendChild(labelFrame);

  // summary
  let summaryForm = createElement("div", "_page-note-content-form-item");
  let summaryLabel = createElement("label", "_page-note-content-form-input-label");
  summaryLabel.innerText = "summary (required)";
  let summaryInput = createElement("input", "_page-note-content-form-input-text");
  summaryInput.name = "summary";
  summaryInput.type = "text";
  summaryForm.appendChild(summaryLabel);
  summaryForm.appendChild(summaryInput);

  // body
  let bodyForm = createElement("div", "_page-note-content-form-item");
  let bodyLabel = createElement("label", "_page-note-content-form-input-label");
  bodyLabel.innerText = "body (required)";
  let bodyInput = createElement("textarea", "_page-note-content-form-input-textarea");
  bodyInput.name = "body";
  bodyInput.type = "textarea";
  bodyForm.appendChild(bodyLabel);
  bodyForm.appendChild(bodyInput);

  // tags
  let tagsForm = createElement("div", "_page-note-content-form-item");
  let tagsLabel = createElement("label", "_page-note-content-form-input-label");
  tagsLabel.innerText = "tags (divide space)";
  let tagsInput = createElement("input", "_page-note-content-form-input-text");
  tagsInput.name = "tags";
  tagsInput.type = "text";
  tagsForm.appendChild(tagsLabel);
  tagsForm.appendChild(tagsInput);

  form.appendChild(submitButtonInput);
  form.appendChild(labelInput);
  form.appendChild(summaryForm);
  form.appendChild(bodyForm);
  form.appendChild(tagsForm);

  let content = createElement("div", "_page-note-content");
  content.appendChild(form);
  return content;

}

// // // TODO: dryがあああ
// /**
//  * fontawesomeで使うアイコンを作る
//  * @param {string} className 
//  * @return {HTMLElement}
//  */
// function createIconElement(className) {
//   let elem = document.createElement("i");
//   elem.className = className;
//   return elem;
// };

/**
 * 
 * @param {string} tag
 * @param {string} className
 * @return {HTMLElement} 
 */
function createElement(tag, className) {
  let elem = document.createElement(tag);
  elem.className = className;
  return elem;
}

// TODO: d & d
// function mouseDown(e) {
//   document.getElementsByClassName("_page-note")[0].classList.add("drag");

//   if (e.type === "mousedown") {
//     var event = e;
//   } else {
//     var event = e.changedTouches[0];
//   }
//   x = event.pageX - e.srcElement.offsetLeft;
//   y = event.pageY - e.srcElement.offsetTop;
//   console.log(x, y);

//   document.body.addEventListener("mousemove", mouseMove, false);
//   document.body.addEventListener("touchmove", mouseMove, false);
// }

// function mouseMove(e) {
//   var drag = document.getElementsByClassName("drag")[0];

//   if (e.type === "mousemove") {
//     var event = e;
//   } else {
//     var event = e.changedTouches[0];
//   }

//   e.preventDefault();

//   drag.style.top = event.pageY - y + "px";
//   drag.style.left = event.pageX - x + "px";

//   drag.addEventListener("mouseup", mouseUp, false);
//   document.body.addEventListener("mouseleave", mouseUp, false);
//   drag.addEventListener("touchend", mouseUp, false);
//   document.body.addEventListener("touchleave", mouseUp, false);
// }

// function mouseUp() {
//   var drag = document.getElementsByClassName("drag")[0];

//   document.body.removeEventListener("mousemove", mouseMove, false);
//   drag.removeEventListener("mouseup", mouseUp, false);
//   document.body.removeEventListener("touchmove", mouseMove, false);
//   drag.removeEventListener("touchend", mouseUp, false);

//   drag.classList.remove("drag");
// }


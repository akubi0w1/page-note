let pageNoteWrapper = document.createElement("div");
pageNoteWrapper.className = "_page-note-wrapper";
pageNoteWrapper.id = "_page-note-wrapper";
(function() {
  // TODO: あれを作るぞ...( ˘ω˘ )

  let pageNote = document.createElement("div");
  pageNote.className = "_page-note";

  pageNote.appendChild(createHeader());
  pageNote.appendChild(createContent());

  pageNoteWrapper.appendChild(pageNote);
  console.log(pageNoteWrapper);

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
  closeButton.appendChild(createIconElement("fas fa-times"));
  // TODO: add event listener
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
  submitButtonInput.appendChild(submitButton);

  // labelColor
  // TODO: カラーコードの定数化
  let colorList = [{ label: "red", code: "#ff389b", checked: true }, { label: "purple", code: "#9b38ff", checked: false }, { label: "blue", code: "#389bff", checked: false }, { label: "green", code: "#00cc33", checked: false }, { label: "orange", code: "#ff9b38", checked: false }];
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

// TODO: dryがあああ
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
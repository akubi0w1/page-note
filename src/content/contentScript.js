import { LABEL_COLOR, LABEL_COLOR_CODE, MESSAGE_TYPE } from "../common/constant";
import { validateNoteSummary, validateNoteBody, validateTag, validateLabel } from "../common/validation";
import { createIconElement } from "../common/element";
import { chromeSendMessage, getSelectorFromElement } from "../common/utility";

// pageNoteWrapper.addEventListener("mousedown", mouseDown, false);
// 座標
// var x;
// var y;
(function() {
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    switch(msg.type) {
      case MESSAGE_TYPE.OPEN_ADD_NOTE_WINDOW:
        renderNewNoteWindow();
        break;
    }
  });

  /**
   * テキストを選択した時のイベント
   */
  document.body.addEventListener("mouseup", function(evt) {
    const oldButton = document.getElementById("_page-note-quick-button-wrapper");
    if (oldButton) {
      oldButton.remove();
      if (evt.target.id === "_page-note-quick-button") {
        renderNewNoteWindow();
        return;
      }
    }

    if(window.getSelection().toString() !== "") {
      const _targetDom = window.getSelection().getRangeAt(0).getClientRects()[0];
      let wrapperElem = document.createElement("div");
      wrapperElem.id = "_page-note-quick-button-wrapper";
      // TODO: 調整で-3rem, -2remしてるとこ、サイトによる違いがめっちゃ激しいから、調整
      wrapperElem.style = `
        top: calc(${_targetDom.y}px + ${window.scrollY}px - 3rem);
        left: calc(${_targetDom.x}px + ${window.scrollX}px + ${_targetDom.width}px - 2rem);
      `;

      let buttonElem = document.createElement("button");
      buttonElem.id = "_page-note-quick-button";
      buttonElem.style = `background-image: url(${chrome.runtime.getURL("assets/icons/icon128.png")});`;
      wrapperElem.appendChild(buttonElem);
      document.body.appendChild(wrapperElem);
    }
  });
})();

/**
 * new note windowの描画
 */
function renderNewNoteWindow() {
  let pageNoteWrapper = document.createElement("div");
  pageNoteWrapper.className = "_page-note-wrapper";
  pageNoteWrapper.id = "_page-note-wrapper";

  let pageNote = document.createElement("div");
  pageNote.className = "_page-note";

  pageNote.appendChild(createHeader());
  pageNote.appendChild(createContent());

  pageNoteWrapper.appendChild(pageNote);

  document.body.appendChild(pageNoteWrapper);
}

/**
 * new note windowの削除
 */
function removeNewNoteWindow() {
  document.getElementById("_page-note-wrapper").remove();
}

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
  closeButton.innerHTML = "X";
  // closeButton.appendChild(createIconElement("fas fa-times"));
  closeButton.onclick = function() {
    removeNewNoteWindow();
  };

  headerTools.appendChild(closeButton);
  
  let header = createElement("div", "_page-note-header");
  header.appendChild(headerItem);
  header.appendChild(headerTools);
  return header;
}

// TODO: 改良...
/**
 * 内容部分を作成
 * 
 * @return {HTMLElement}
 */
function createContent() {
  const selectedText = document.getSelection().toString();
  const selectedSelector = getSelectorFromElement(document.getSelection().anchorNode.parentElement).join(" > ");  
  const tabTitle = document.title;
  const tabUrl = document.URL;


  let form = createElement("form", "_page-note-content-form");

  // submitButton
  let submitButtonInput = createElement("div", "_page-note-content-form-item al-right ps-top-right");
  let submitButton = createElement("button", "btn btn-accent");
  submitButton.type = "submit";
  submitButton.innerText = "save";
  submitButton.onclick = function(evt) {
    evt.preventDefault();

    var errorStack = [];

    const summaryValue = form.summary.value;
    try {
      validateNoteSummary(summaryValue);
    } catch (err) {
      errorStack.push(err.message);
    }

    const bodyValue = form.body.value;
    try {
      validateNoteBody(bodyValue);
    } catch(err) {
      errorStack.push(err.message);
    }
    
    const tagsList = form.tags.value
      .split(",")
      .map(tag => tag.replace(/^\s+|\s+$/g, ""))
      .filter((v, i, a) => a.indexOf(v) === i)
      .filter(tag => {
        try {
          validateTag(tag);
          return true;
        } catch(err) {
          return false;
        }
      });
    
    const labelValue = form.labelColor.value;
    try {
      validateLabel(labelValue);
    } catch(err) {
      errorStack.push(err.message);
    }

    if (errorStack.length > 0) {
      let errorBarElem = createElement("div", "_page-note-error-bar");
      let ulElem = document.createElement("ul");
      errorStack.forEach(err => {
        let liElem = document.createElement("li");
        liElem.innerText = err;
        ulElem.appendChild(liElem);
      });
      errorBarElem.appendChild(ulElem);
      document.getElementById("errorList").appendChild(errorBarElem);
      return;
    }
    // NOTE: 登録したくなければ、ここ以前に弾いてください
    chromeSendMessage(
      MESSAGE_TYPE.ADD_NOTE,
      {
        url: tabUrl,
        selector: selectedSelector,
        selectedText: selectedText,
        title: tabTitle,
        summary: summaryValue,
        body: bodyValue,
        tags: tagsList,
        label: labelValue
      }
    );
    removeNewNoteWindow();
  };
  // NOTE: end on click
  submitButtonInput.appendChild(submitButton);

  // labelColor
  let colorList = [{ label: "red", code: LABEL_COLOR_CODE.RED, checked: true }, { label: "purple", code: LABEL_COLOR_CODE.PURPLE, checked: false }, { label: "blue", code: LABEL_COLOR_CODE.BLUE, checked: false }, { label: "green", code: LABEL_COLOR_CODE.GREEN, checked: false }, { label: "orange", code: LABEL_COLOR_CODE.ORANGE, checked: false }];
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

  // selected text info
  let selectedTextInfo = createElement("div", "_page-note-content-form-item");
  selectedTextInfo.innerHTML = `
  <label class="_page-note-content-form-input-label">selected text</label>
  <label class="_page-note-content-info">${selectedText}</label>
  `;
  
  // selected origin page info
  let originInfo = createElement("div", "_page-note-content-form-item");
  originInfo.innerHTML = `
  <label class="_page-note-content-form-input-label">origin page</label>
  <label class="_page-note-content-info">
    <a href="${tabUrl}" target="_blank">${tabTitle}</a>
  </label>
  `;

  // summary
  let summaryForm = createElement("div", "_page-note-content-form-item");
  let summaryLabel = createElement("label", "_page-note-content-form-input-label");
  summaryLabel.innerText = "summary (required)";
  let summaryInput = createElement("input", "_page-note-content-form-input-text");
  summaryInput.name = "summary";
  summaryInput.type = "text";
  summaryInput.value = selectedText;
  summaryForm.appendChild(summaryLabel);
  summaryForm.appendChild(summaryInput);

  // body
  let bodyForm = createElement("div", "_page-note-content-form-item");
  let bodyLabel = createElement("label", "_page-note-content-form-input-label");
  bodyLabel.innerText = "body";
  let bodyInput = createElement("textarea", "_page-note-content-form-input-textarea");
  bodyInput.name = "body";
  bodyForm.appendChild(bodyLabel);
  bodyForm.appendChild(bodyInput);

  // tags
  let tagsForm = createElement("div", "_page-note-content-form-item");
  let tagsLabel = createElement("label", "_page-note-content-form-input-label");
  tagsLabel.innerText = "tags (divide comma)";
  let tagsInput = createElement("input", "_page-note-content-form-input-text");
  tagsInput.name = "tags";
  tagsInput.type = "text";
  tagsForm.appendChild(tagsLabel);
  tagsForm.appendChild(tagsInput);

  // errorList
  let errorBar = createElement("div", "_page-note-content-form-item");
  errorBar.id = "errorList";

  form.appendChild(submitButtonInput);
  form.appendChild(labelInput);
  form.appendChild(errorBar);
  form.appendChild(selectedTextInfo);
  form.appendChild(originInfo);
  form.appendChild(summaryForm);
  form.appendChild(bodyForm);
  form.appendChild(tagsForm);

  let content = createElement("div", "_page-note-content");
  content.appendChild(form);
  return content;

}

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


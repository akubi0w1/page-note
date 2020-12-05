import { LABEL_COLOR, LABEL_COLOR_CODE, MESSAGE_TYPE, OPTION_KEY, ICON, DEFAULT_OPTION } from "../common/constant";
import { validateNoteSummary, validateNoteBody, validateTag, validateLabel } from "../common/validation";
import { createIconElement, addDragAndDrop } from "../common/element";
import { chromeSendMessage, getSelectorFromElement, getColorCodeForHighlight, getColorCodeForLabel, autoSummarization, calcLineNumberForSummarization } from "../common/utility";
import { getAllOptions, getOptionsByKey, restoreOption } from "../common/options";

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
      case MESSAGE_TYPE.GET_NOTE_BY_URL_RESPONSE:
        // ハイライト
        chrome.storage.sync.get(OPTION_KEY.MARK_TEXT, function(option) {
          if (typeof option.markText !== "undefined" && option.markText) {
            msg.payload.forEach(note => { markText(note); });
          }
        });
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
      buttonElem.style = `background-image: url(${chrome.runtime.getURL(ICON.ADD_NOTE)});`;
      wrapperElem.appendChild(buttonElem);
      document.body.appendChild(wrapperElem);
    }
  });

  // ハイライトに必要なので
  chromeSendMessage(MESSAGE_TYPE.GET_NOTE_BY_URL, {url: document.URL});

})();

/**
 * new note windowの描画
 */
function renderNewNoteWindow() {
  removeNewNoteWindow();

  let pageNoteWrapper = document.createElement("div");
  pageNoteWrapper.className = "_page-note-wrapper";
  pageNoteWrapper.id = "_page-note-wrapper";

  let pageNote = document.createElement("div");
  pageNote.className = "_page-note";

  pageNote.appendChild(createHeader());
  pageNote.appendChild(createContent());

  pageNoteWrapper.appendChild(pageNote);

  document.body.appendChild(pageNoteWrapper);

  addDragAndDrop("_page-note-header", "_page-note-wrapper");
}

/**
 * new note windowの削除
 */
function removeNewNoteWindow() {
  let NewNoteWindow = document.getElementById("_page-note-wrapper");
  if(NewNoteWindow) {
    document.getElementById("_page-note-wrapper").remove();
  }
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
  header.id = "_page-note-header";
  header.appendChild(headerItem);
  header.appendChild(headerTools);
  return header;
}

// TODO: 改良...
/**
 * new note内容部分を作成
 * 
 * @return {HTMLElement}
 */
function createContent() {
  const clearErrorBar = () => {
    if (document.getElementById("_page-note-content-form-error-bar")) {
      document.getElementById("_page-note-content-form-error-bar").remove();
    }
  };

  const selectedText = document.getSelection().toString();
  let selectedSelector = "";
  if (selectedText) {
    selectedSelector = getSelectorFromElement(document.getSelection().anchorNode.parentElement).join(" > ");
  } 
  const tabTitle = document.title;
  const tabUrl = document.URL;


  let form = createElement("form", "_page-note-content-form");
  form.method = "GET";

  // submitButton
  let submitButtonInput = createElement("div", "_page-note-content-form-item al-right ps-top-right");
  let submitButton = createElement("button", "btn btn-accent");
  submitButton.type = "submit";
  submitButton.innerText = "save";
  submitButton.onclick = function(evt) {
    
    evt.preventDefault();
    clearErrorBar();

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

    // happen error
    if (errorStack.length > 0) {
      let errorBarElem = createElement("div", "_page-note-error-bar");
      errorBarElem.id = "_page-note-content-form-error-bar";
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
    markText({
      url: tabUrl,
      selector: selectedSelector,
      selectedText: selectedText,
      title: tabTitle,
      summary: summaryValue,
      body: bodyValue,
      tags: tagsList,
      label: labelValue
    });
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
  let selectedTextTitle = createElement("div", "_page-note-content-form-title");
  let selectedTextLabel = createElement("div", "_page-note-content-form-input-label");
  selectedTextLabel.innerText = "selected text";
  let selectedTextValue = createElement("label", "_page-note-content-info");
  if(selectedText.length > 60) {
    selectedTextValue.innerText = selectedText.substring(0, 60) + "...";
  } else {
    selectedTextValue.innerText = selectedText;
  }
  let selectedTextControl = document.createElement("div");
  let copyToSummaryBtn = document.createElement("button");
  copyToSummaryBtn.className = "btn btn-sub-outline";
  copyToSummaryBtn.id = "_page-note-btn-copy-to-summary";
  copyToSummaryBtn.innerText = "to summary";
  copyToSummaryBtn.type = "button";
  copyToSummaryBtn.style.marginRight = "5px";
  copyToSummaryBtn.addEventListener("click", function(evt) {
    summaryInput.value = selectedText;
  });
  let copyToBodyBtn = document.createElement("button");
  copyToBodyBtn.className = "btn btn-sub-outline";
  copyToBodyBtn.id = "_page-note-btn-copy-to-body";
  copyToBodyBtn.innerText = "to body";
  copyToBodyBtn.type = "button";
  copyToBodyBtn.addEventListener("click", function() {
    bodyInput.value = selectedText;
  });
  selectedTextControl.appendChild(copyToSummaryBtn);
  selectedTextControl.appendChild(copyToBodyBtn);
  selectedTextTitle.appendChild(selectedTextLabel);
  selectedTextTitle.appendChild(selectedTextControl);
  selectedTextInfo.appendChild(selectedTextTitle);
  selectedTextInfo.appendChild(selectedTextValue);


  // selected origin page info
  let originInfo = createElement("div", "_page-note-content-form-item");
  originInfo.innerHTML = `
  <div class="_page-note-content-form-title">
    <label class="_page-note-content-form-input-label">origin page</label>
  </div>
  <label class="_page-note-content-info">
    <a href="${tabUrl}" target="_blank">${tabTitle}</a>
  </label>
  `;

  // summary
  let summaryForm = createElement("div", "_page-note-content-form-item");
  let summaryTitle = createElement("div", "_page-note-content-form-title");
  summaryTitle.innerHTML = `
    <label class="_page-note-content-form-input-label">summary (require)</label>
  `;
  let summaryInput = createElement("input", "_page-note-content-form-input-text");
  summaryInput.name = "summary";
  summaryInput.type = "text";
  summaryInput.autocomplete = "off";
  summaryForm.appendChild(summaryTitle);
  summaryForm.appendChild(summaryInput);

  // body
  let bodyForm = createElement("div", "_page-note-content-form-item");
  let bodyTitle = createElement("div", "_page-note-content-form-title");
  let bodyLabel = createElement("label", "_page-note-content-form-input-label");
  bodyLabel.innerText = "body";
  let bodyControl = document.createElement("div");
  let bodySummarizationBtn = createElement("button", "btn btn-sub-outline")
  bodySummarizationBtn.id = "_page-note-btn-summarization";
  bodySummarizationBtn.innerText = "summarization";
  bodySummarizationBtn.type = "button";
  bodySummarizationBtn.addEventListener("click", function(evt) {
    clearErrorBar();
    restoreOption(
      { summarizationSeparator: DEFAULT_OPTION.summarizationSeparator, summarizationPercentage: DEFAULT_OPTION.summarizationPercentage },
      async function(result) {
        try {
          bodyInput.readOnly = true;
          const lineNumber = calcLineNumberForSummarization(bodyInput.value, result.summarizationSeparator, result.summarizationPercentage);
          const summarizationText = await autoSummarization(bodyInput.value, lineNumber, result.summarizationSeparator);
          // IDEA: もとに戻すボタンの実装...
          bodyInput.value = summarizationText;
        } catch (err) {
          // IDEA: errorlistじゃなくて、別の場所or別のbarを作りたい。気もする
          let errorBarElem = createElement("div", "_page-note-error-bar");
          errorBarElem.id = "_page-note-content-form-error-bar";
          let ulElem = document.createElement("ul");
          let liElem = document.createElement("li");
          liElem.innerText = err.message;
          ulElem.appendChild(liElem);
          errorBarElem.appendChild(ulElem);
          document.getElementById("errorList").appendChild(errorBarElem);
        }
        bodyInput.readOnly = false;
      }
    );
  });
  let bodyInput = createElement("textarea", "_page-note-content-form-input-textarea");
  bodyInput.name = "body";
  bodyControl.appendChild(bodySummarizationBtn);
  bodyTitle.appendChild(bodyLabel);
  bodyTitle.appendChild(bodyControl);
  bodyForm.appendChild(bodyTitle);
  bodyForm.appendChild(bodyInput);

  // tags
  let tagsForm = createElement("div", "_page-note-content-form-item");
  let tagsTitle = createElement("div", "_page-note-content-form-title");
  tagsTitle.innerHTML = `
    <label class="_page-note-content-form-input-label">tags (divide comma)</label>
  `;
  let tagsInput = createElement("input", "_page-note-content-form-input-text");
  tagsInput.name = "tags";
  tagsInput.type = "text";
  tagsInput.autocomplete = "off";
  tagsForm.appendChild(tagsTitle);
  tagsForm.appendChild(tagsInput);

  // errorList
  let errorBar = createElement("div", "_page-note-content-form-item");
  errorBar.id = "errorList";

  form.appendChild(submitButtonInput);
  form.appendChild(labelInput);
  form.appendChild(errorBar);
  if (selectedText !== "") {
    form.appendChild(selectedTextInfo);
  }
  // form.appendChild(originInfo);
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

/**
 * markタグを差し込む
 * @param {Object} note
 * @param {Number} note.id
 * @param {String} note.title
 * @param {String} note.url
 * @param {String} note.selector
 * @param {String} note.selectedText
 * @param {String} note.summary
 * @param {String} note.body
 * @param {String} note.label
 * @param {Array} note.tags
 */
function markText(note) {
  if(note.selector === "") {
    return;
  }
  let markElem = document.createElement("mark");
  markElem.style = `
    background-color: ${getColorCodeForHighlight(note.label)};
    color: inherit;
  `;
  let targetElem = document.querySelector(note.selector);
  markElem.innerHTML = targetElem.innerHTML;
  targetElem.innerHTML = markElem.outerHTML;

  // クイックアクセス用のアイコンを差し込む
  const rect = targetElem.getBoundingClientRect();
  let showIconElem = document.createElement("button");
  // TODO: この辺sassにつっこみたい
  showIconElem.style = `
    background-color: transparent;
    background-image: url(${chrome.runtime.getURL(ICON.EXIST_NOTE)});
    margin-top: -16px;
    position: absolute;
    background-size: cover;
    height: 20px;
    width: 20px;
    border: 0;
  `;
  showIconElem.addEventListener("click", function(evt) {
    let oldQuickView = document.getElementById("_page-note-quick-view");
    if (oldQuickView) {
      oldQuickView.remove();
      return;
    }

    let quickView = createQuickView(note);
    quickView.style = `
      top: ${evt.pageY}px;
      left: ${evt.pageX}px;
      position: absolute;
    `;

    document.body.appendChild(quickView);
  });
  targetElem.parentNode.insertBefore(showIconElem, targetElem);
}


/**
 * クイックビューの窓を作る
 * @param {Object} note
 * @param {Number} note.id
 * @param {String} note.title
 * @param {String} note.url
 * @param {String} note.selector
 * @param {String} note.selectedText
 * @param {String} note.summary
 * @param {String} note.body
 * @param {String} note.label
 * @param {Array} note.tags
 * @return {HTMLElement}
 */
function createQuickView(note) {
  // quick view
  let quickViewElem = document.createElement("div");
  quickViewElem.className = "_page-note-quick-view";
  quickViewElem.id = "_page-note-quick-view";

  // content
  let contentElem = document.createElement("div");
  contentElem.className = "_page-note-quick-view-content";
  
  let headerElem = document.createElement("div");
  headerElem.className = "_page-note-quick-view-content-header";
  let summaryElem = document.createElement("label");
  summaryElem.className = "_page-note-quick-view-content-summary";
  summaryElem.innerText = note.summary;
  let closeButtonElem = document.createElement("button");
  closeButtonElem.className = "btn btn-white";
  closeButtonElem.innerText = "x";
  closeButtonElem.addEventListener("click", function() {
    quickViewElem.remove();
  });
  headerElem.appendChild(summaryElem);
  headerElem.appendChild(closeButtonElem);

  let bodyElem = document.createElement("div");
  bodyElem.className = "_page-note-quick-view-content-body";
  bodyElem.innerText = note.body;

  let footerElem = document.createElement("div");
  footerElem.className = "_page-note-quick-view-content-footer";
  let tagListElem = document.createElement("ul");
  tagListElem.className = "_page-note-quick-view-content-footer-tag-list";
  note.tags.forEach(tag => {
    let tagElem = document.createElement("li");
    tagElem.className = "_page-note-quick-view-content-footer-tag-item";
    tagElem.innerText = tag;
    tagListElem.appendChild(tagElem);
  });
  let controlElem = document.createElement("ul");
  controlElem.className = "_page-note-quick-view-content-footer-control";
  controlElem.innerHTML = `
    <li><a href="${note.url}" target="_blank">origin</a></li>
  `;
  footerElem.appendChild(tagListElem);
  footerElem.appendChild(controlElem);

  contentElem.appendChild(headerElem);
  contentElem.appendChild(bodyElem);
  contentElem.appendChild(footerElem);

  // label
  let labelElem = document.createElement("div");
  labelElem.className = "_page-note-quick-view-label";
  labelElem.style = `background-color: ${getColorCodeForLabel(note.label)};`;

  quickViewElem.appendChild(contentElem);
  quickViewElem.appendChild(labelElem);

  return quickViewElem;
}
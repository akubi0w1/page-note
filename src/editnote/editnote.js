const LABEL_COLOR = {
  RED: "red",
  PURPLE: "purple",
  BLUE: "blue",
  GREEN: "green",
  ORANGE: "orange"
};


(function(){
  // TODO: manage系で共通化したい
  document.getElementById("header-logo").onclick = function() {
    chrome.tabs.getCurrent(function(tab) {
      chrome.tabs.update(tab.id, { url: "src/notelist/index.html" });
    });
  };

  const idQuery = divideQuery(location.search.substr(1))
    .find(query => query.key === "id");

  if(typeof idQuery === "undefined") {
    // TODO: なんとかして
    console.log("new note");
    return;
  };

  const id = parseInt(idQuery.value, 10);
  if (isNaN(id)) {
    console.log("id is Nan");
    return;
  }

  // TODO: noteの探索
  const oldNote = chrome.extension.getBackgroundPage().NOTE_LIST.find(note => note.id === id);
  renderInfomation(oldNote);
  injectValue(oldNote);

  // save note
  document.getElementById("edit-note-save").onclick = function (event) {
    event.preventDefault();
    let errorStack = [];

    const form = document.getElementById("edit-note");
    const summaryValue = form.summary.value;
    if (validSummary(summaryValue) !== "") { errorStack.push(validSummary(summaryValue)); }

    const bodyValue = form.body.value;
    if (validBody(bodyValue) !== "") { errorStack.push(validBody(bodyValue)); }

    const tagsList = form.tags.value
      .split(",")
      .map(tag => tag.replace(/^\s+|\s+$/g, ""))
      .filter((v, i, a) => a.indexOf(v) === i)
      .filter(tag => validTag(tag));

    const labelValue = form.labelColor.value;
    if (validLabel(labelValue) !== "") { errorStack.push(validLabel(labelValue)); }

    // handle error
    if(errorStack.length > 0) {
      // TODO: funcにきり出せそう
      clearNotify();
      let errorBarElem = document.createElement("div");
      errorBarElem.className = "notify-bar notify-bar-wide notify-bar-error";
      let ulElem = document.createElement("ul");
      errorStack.forEach(err => {
        let liElem = document.createElement("li");
        liElem.innerText = err;
        ulElem.appendChild(liElem);
      });
      errorBarElem.appendChild(ulElem);
      document.getElementById("notify").appendChild(errorBarElem);
      return;
    }

    chrome.extension.getBackgroundPage().updateNoteById(
      id,
      oldNote.url,
      oldNote.inlineDom,
      oldNote.innerText,
      oldNote.title,
      summaryValue,
      bodyValue,
      tagsList,
      labelValue
    );

    // TODO: funcにきり出せそう
    clearNotify();
    let infoBarElem = document.createElement("div");
    infoBarElem.className = "notify-bar notify-bar-wide notify-bar-success";
    let ulElem = document.createElement("ul");
    let liElem = document.createElement("li");
    liElem.innerText = "success to send request";
    ulElem.appendChild(liElem);
    infoBarElem.appendChild(ulElem);
    document.getElementById("notify").appendChild(infoBarElem);
  };
}());

function clearNotify() {
  let targetElem = document.getElementById("notify");
  if (typeof targetElem === "undefined") { return; }
  let clone = targetElem.cloneNode(false);
  targetElem.parentNode.replaceChild(clone, targetElem);
}


/**
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
 */
function renderInfomation(note) {
  var targetElem = document.getElementById("note-infomation");
  // id
  var idRow = document.createElement("tr");
  var idKey = document.createElement("td");
  idKey.innerText = "ID";
  var idValue = document.createElement("td");
  idValue.innerText = note.id;
  idRow.appendChild(idKey);
  idRow.appendChild(idValue);

  // origin
  var originRow = document.createElement("tr");
  var originKey = document.createElement("td");
  originKey.innerText = "Origin";
  var originValue = document.createElement("td");
  originValue.innerHTML = `<a href="${note.url}" target="_blank">${note.title}</a>`;
  originRow.appendChild(originKey);
  originRow.appendChild(originValue);

  // innertext
  var innerTextRow = document.createElement("tr");
  var innerTextKey = document.createElement("td");
  innerTextKey.innerText = "innerText";
  var innerTextValue = document.createElement("td");
  innerTextValue.innerText = note.innerText;
  innerTextRow.appendChild(innerTextKey);
  innerTextRow.appendChild(innerTextValue);

  targetElem.appendChild(idRow);
  targetElem.appendChild(originRow);
  targetElem.appendChild(innerTextRow);
}

/**
 * 編集だった場合に、元の値の挿入
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
 */
function injectValue(note) {
  var form = document.getElementById("edit-note");

  // label
  document.getElementById("label-color-" + note.label).checked = true;

  // sumamry
  form.summary.value = note.summary;

  // body
  form.body.value = note.body;

  // tags
  form.tags.value = note.tags;
}


/**
 *  * クエリをオブジェクトの配列に変換
 * id=1&name=amy -> [{key: id, value: 1 }, { key: name, value: "amy" }]
 * 
 * @param {String} queryString 
 */
function divideQuery(queryString) {
  return queryString.split("&").map(item => {
    var pair = item.split("=");
    return {
      key: pair[0],
      value: pair[1]
    };
  });
}

// NOTE: validation
/**
 * summaryに対してバリデーションを行う
 * 
 * @param {String} summary 
 * @return {String}
 */
function validSummary(summary) {
  if (summary === "") {
    return "error: summary is empty";
  }
  return "";
}

/**
 * bodyに対してバリデーションを行う
 * 
 * @param {String} body 
 * @return {String}
 */
function validBody(body) {
  return "";
}

/**
 * tagに対してバリデーションを行う
 * 
 * @param {String} tag 
 * @return {Boolean}
 */
function validTag(tag) {
  if (tag === "") {
    return false;
  }
  return true;
}

/**
 * labelに対してバリデーションを行う
 * 
 * @param {String} label 
 * @return {Boolean}
 */
function validLabel(label) {
  if (label != LABEL_COLOR.RED && label != LABEL_COLOR.PURPLE && label != LABEL_COLOR.BLUE && label != LABEL_COLOR.GREEN && label != LABEL_COLOR.ORANGE) {
    return "error: label is invalid";
  }
  return "";
}

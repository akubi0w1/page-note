const DB_VERSION = 1;
const DB_NAME = "pageNote";

chrome.runtime.onInstalled.addListener(function () {
  // create contextMenu
  chrome.contextMenus.create({
    "id": "pageNoteContextMenu",
    "title": "PageNote",
    "contexts": ["all"],
    "onclick": chrome.contextMenus.onClicked.addListener(function(info, tab) {
      chrome.tabs.get(tab.id, function(tab) {
        chrome.tabs.executeScript(
          tab.id,
          { code: "document.getElementById(\"_page-note-wrapper\").style.display = \"block\";" }
        );
      });
    })
  });

  /**
   * DB
   */
  if (!window.indexedDB) {
    window.alert("このブラウザーは安定版の IndexedDB をサポートしていません。IndexedDB の機能は利用できません。");
  }
  createDB();
});

/**
 * DBの定義
 */
function createDB() {
  var openReq = window.indexedDB.open(DB_NAME, DB_VERSION);
  openReq.onerror = (event) => {
    console.log("failed to create database");
  };
  openReq.onsuccess = (event) => {
    console.log("success to create database");
  };
  // create table
  openReq.onupgradeneeded = (event) => {
    var db = event.target.result;
    var objStore = db.createObjectStore("notes", { autoIncrement: true });
    objStore.createIndex("url", "url", { unique: false });
    objStore.createIndex("inline_dom", "inline_dom", { unique: false });
    objStore.createIndex("inline_text", "inline_text", { unique: false });
    objStore.createIndex("title", "title", { unique: false });
    objStore.createIndex("summary", "summary", { unique: false });
    objStore.createIndex("body", "body", { unique: false });
    objStore.createIndex("tags", "tags", { unique: false });
    // red / purple / blue / green / orange
    objStore.createIndex("label", "label", { unique: false });
  };
}

/**
 * データの追加
 * 
 * @param {String} url 
 * @param {String} inlineDom 
 * @param {String} inlineText 
 * @param {String} title 
 * @param {String} summary 
 * @param {String} body 
 * @param {Array} tags 
 * @param {String} label 
 */
function insertNote(url, inlineDom, inlineText, title, summary, body, tags, label) {
  var openReq = window.indexedDB.open(DB_NAME, DB_VERSION);
  openReq.onerror = function(event) {
    console.log("failed to open db");
  };
  openReq.onsuccess = function(event) {
    var db = event.target.result;
    var trans = db.transaction(["notes"], "readwrite");
    var store = trans.objectStore("notes");
    var addRequest = store.add({url, inlineDom, inlineText, title, summary, body, tags, label});
    addRequest.onsuccess = function(event) {
      console.log("success add data");
    };
    trans.oncomplete = function(event) {
      console.log("complete transaction");
    };
  };
}

// TODO: constantsに移動？
const LABEL_COLOR = {
  RED: "red",
  PURPLE: "purple",
  BLUE: "blue",
  GREEN: "green",
  ORANGE: "orange"
};

chrome.runtime.onMessage.addListener(function (msg, sender) {
  // TODO: switch caseでmsg.typeをハンドリング
  console.log(msg.type);
  console.log(msg.payload);
  insertNote(
    msg.payload.url,
    msg.payload.inlineDom,
    msg.payload.inlineText,
    msg.payload.title,
    msg.payload.summary,
    msg.payload.body,
    msg.payload.tags,
    msg.payload.label
  );
});
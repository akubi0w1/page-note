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
  var openReq = window.indexedDB.open("pageList", 1);
  openReq.onerror = (event) => {
    console.log("failed to create database");
  }
  openReq.onsuccess = (event) => {
    console.log("success to create database");
  }
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
    objStore.createIndex("label", "url", { unique: true });
  }
}
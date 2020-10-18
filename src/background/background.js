import Dexie from "dexie";

const DB_VERSION = 1;
const DB_NAME = "pageNote";

// TODO: popup <-> backgroundのmessage passing実装して、ここの部分をなくしたい
var NOTE_LIST = [];

chrome.runtime.onInstalled.addListener(function () {
  // create contextMenu
  chrome.contextMenus.create({
    "id": "pageNoteContextMenu",
    "title": "PageNote",
    "contexts": ["all"],
    "onclick": chrome.contextMenus.onClicked.addListener(function(info, tab) {
      chrome.tabs.get(tab.id, function(tab) {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "OPEN_NEW_NOTE_WINDOW", payload: {} }
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

  // TODO: デバッグ用
  // chrome.tabs.create({ url: "src/notelist/index.html" });
  // chrome.tabs.create({ url: "src/editnote/index.html" });
});


/**
 * DBの定義
 */
function createDB() {
  let conn = new Dexie(DB_NAME);
  // TODO: できるならtagsとlabelを外部キーで管理したい欲
  // REF: definition scheme: https://dexie.org/docs/Version/Version.stores()
  conn.version(DB_VERSION).stores({
    notes: "++id,url,title,selector,selectedText,summary,body,tags,label"
  });
  return conn;
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
      getAllNotes();
    };
    trans.oncomplete = function(event) {
      console.log("complete transaction");
    };
  };
}

/**
 * 
 * @param {Number} id 
 * @param {String} url
 * @param {String} inlineDom
 * @param {String} inlineText
 * @param {String} title
 * @param {String} summary
 * @param {String} body
 * @param {Array} tags
 * @param {String} label
 */
function updateNoteById(id, url, inlineDom, inlineText, title, summary, body, tags, label) {
  var openReq = window.indexedDB.open(DB_NAME, DB_VERSION);
  openReq.onerror = function (event) {
    console.log("failed to open db");
  };
  openReq.onsuccess = function (event) {
    var db = event.target.result;
    var trans = db.transaction(["notes"], "readwrite");
    var store = trans.objectStore("notes");
    var updateRequest = store.put({ id, url, inlineDom, inlineText, title, summary, body, tags, label });
    updateRequest.onsuccess = function (event) {
      console.log("success update data");
      getAllNotes();
    };
    trans.oncomplete = function (event) {
      console.log("complete transaction");
    };
  };
}

/**
 * データの全取得
 */
function getAllNotes() {
  var openReq = window.indexedDB.open(DB_NAME, DB_VERSION);
  openReq.onerror = function (event) {
    console.log("failed to open db");
  };
  openReq.onsuccess = function (event) {
    var db = event.target.result;
    var trans = db.transaction(["notes"], "readwrite");
    var store = trans.objectStore("notes");
    var getRequest = store.getAll();
    getRequest.onsuccess = function (event) {
      NOTE_LIST = event.target.result;
      console.log("success get data");
    };
    trans.oncomplete = function (event) {
      console.log("complete transaction");
    };
  };
}

/**
 * idを指定してデータを削除
 * 
 * @param {Number} id 
 */
function deleteNoteById(id) {
  var openReq = window.indexedDB.open(DB_NAME, DB_VERSION);
  openReq.onerror = function (event) {
    console.log("failed to open db");
  };
  openReq.onsuccess = function (event) {
    var db = event.target.result;
    var trans = db.transaction(["notes"], "readwrite");
    var store = trans.objectStore("notes");
    var deleteRequest = store.delete(id);
    deleteRequest.onsuccess = function (event) {
      getAllNotes();
      console.log("success delete data");
    };
    trans.oncomplete = function (event) {
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

/**
 * イベントリスナーの追加
 */
// contentから送られるてくるmessageのハンドリング
chrome.runtime.onMessage.addListener(async function(msg, sender) {
  switch(msg.type) {
    case "ADD_NOTE":
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
      break;
    case "GET_ALL_NOTE":
      chrome.runtime.sendMessage({
        type: "GET_ALL_NOTE_RESPONSE",
        payload: await noteRepo.getAll()
      });
      break;
  }
});

/**
 * DB Class
 */
class NoteRepository {
  /**
   * 
   * @param {Dexie} db 
   */
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    const all = await this.db.notes.toArray();
    return all;
  }

  /**
   * 作成
   * @param {String} url 
   * @param {String} title 
   * @param {String} selectedText 
   * @param {String} summary 
   * @param {String} body 
   * @param {Array<String>} tags 
   * @param {String} label 
   */
  async insert(url, title, selectedText, summary, body, tags, label) {
    const id = await this.db.notes.add({
      url,
      title,
      selectedText,
      summary,
      body,
      tags,
      label
    });
    return id;
  }

  /**
   * 更新
   * @param {Number} id 
   * @param {String} url
   * @param {String} title
   * @param {String} selectedText
   * @param {String} summary
   * @param {String} body
   * @param {Array<String>} tags
   * @param {String} label
   */
  async update(id, url="", title="", selectedText="", summary="", body="", tags=[], label="red") {
    const result = await this.db.notes.update(id, {
      url: url,
      title: title,
      selectedText: selectedText,
      summary: summary,
      body: body,
      tags: tags,
      label: label
    });
  }

  /**
   * 削除
   * @param {Number} id 
   */
  async delete(id) {
    const result = await this.db.notes.delete(id);
  }
}


/**
 * DB作成
 */
var db = createDB();
var noteRepo = new NoteRepository(db);
noteRepo.getAll()
import Dexie from "dexie";

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
  /**
  * DB作成
  */
  var db = createDB();
  var noteRepo = new NoteRepository(db);

  /**
  * イベントリスナーの追加
  */
  chrome.runtime.onMessage.addListener(async function (msg, sender) {
    switch (msg.type) {
      case "ADD_NOTE":
        noteRepo.insert(
          msg.payload.url,
          msg.payload.title,
          msg.payload.selector,
          msg.payload.selectedText,
          msg.payload.summary,
          msg.payload.body,
          msg.payload.tags,
          msg.payload.label
        )
        break;
      case "UPDATE_NOTE":
        noteRepo.update(
          msg.payload.id,
          msg.payload.url,
          msg.payload.title,
          msg.payload.selector,
          msg.payload.selectedText,
          msg.payload.summary,
          msg.payload.body,
          msg.payload.tags,
          msg.payload.label
        );
        break;
      case "DELETE_NOTE_BY_ID":
        noteRepo.delete(msg.payload.id);
        chrome.runtime.sendMessage({
          type: "GET_ALL_NOTE_RESPONSE",
          payload: await noteRepo.getAll()
        });
        break;
      case "GET_ALL_NOTE":
        chrome.runtime.sendMessage({
          type: "GET_ALL_NOTE_RESPONSE",
          payload: await noteRepo.getAll()
        });
        break;
      case "GET_NOTE_BY_ID":
        chrome.runtime.sendMessage({
          type: "GET_NOTE_BY_ID_RESPONSE",
          payload: await noteRepo.getById(msg.payload.id)
        });
        break;
    }
  });

  // TODO: デバッグ用
  chrome.tabs.create({ url: "src/notelist/index.html" });
  chrome.tabs.create({ url: "src/editnote/index.html?id=2" });
  noteRepo.insert("example.URL", "title", "se", "selected text", "summary", "boyd", ["tag", "tag1"], "red");
  noteRepo.insert("example.URL", "title", "se", "selected text", "summary", "boyd", ["tag", "tag1"], "purple");
  noteRepo.insert("example.URL", "title", "se", "selected text", "summary", "boyd", ["tag", "tag1"], "blue");
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

  async getById(id) {
    const result = await this.db.notes.get(id);
    return result;
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
  async insert(url, title, selector, selectedText, summary, body, tags, label) {
    const id = await this.db.notes.add({
      url,
      title,
      selector,
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
  async update(id, url = "", title = "", selector="",selectedText="", summary="", body="", tags=[], label="red") {
    const result = await this.db.notes.update(id, {
      url: url,
      title: title,
      selector: selector,
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


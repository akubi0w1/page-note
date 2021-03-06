import Dexie from "dexie";
import { MESSAGE_TYPE, DB_INFO } from "../common/constant";
import { TEXT_SUMMARIZATION_API } from "../common/secret";
import { chromeSendMessage, downloadFile } from "../common/utility";
import PageNoteError from "../common/error";

chrome.runtime.onInstalled.addListener(function () {
  // create contextMenu
  chrome.contextMenus.create({
    "id": "pageNoteContextMenu",
    "title": "PageNote",
    "contexts": ["all"],
    "onclick": chrome.contextMenus.onClicked.addListener(function(info, tab) {
      chrome.tabs.get(tab.id, function(tab) {
        // TODO: utilに書き出し
        chrome.tabs.sendMessage(
          tab.id,
          { type: MESSAGE_TYPE.OPEN_ADD_NOTE_WINDOW, payload: {} }
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
  chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
    switch (msg.type) {
      case MESSAGE_TYPE.ADD_NOTE:
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
        chromeSendMessage(MESSAGE_TYPE.GET_ALL_NOTE_RESPONSE, await noteRepo.getAll());
        break;
      case MESSAGE_TYPE.UPDATE_NOTE_BY_ID:
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
        chromeSendMessage(MESSAGE_TYPE.GET_ALL_NOTE_RESPONSE, await noteRepo.getAll());
        break;
      case MESSAGE_TYPE.DELETE_NOTE_BY_ID:
        noteRepo.delete(msg.payload.id);
        chromeSendMessage(MESSAGE_TYPE.GET_ALL_NOTE_RESPONSE, await noteRepo.getAll());
        break;
      case MESSAGE_TYPE.GET_ALL_NOTE:
        chromeSendMessage(MESSAGE_TYPE.GET_ALL_NOTE_RESPONSE, await noteRepo.getAll());
        break;
      case MESSAGE_TYPE.GET_NOTE_BY_ID:
        chromeSendMessage(MESSAGE_TYPE.GET_NOTE_BY_ID_RESPONSE, await noteRepo.getById(msg.payload.id));
        break;
      case MESSAGE_TYPE.GET_NOTE_BY_URL:
        const notes = await noteRepo.getByURL(msg.payload.url);
        chromeSendMessage(MESSAGE_TYPE.GET_NOTE_BY_URL_RESPONSE, notes);
        // TODO: utilに書き出し
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { type: MESSAGE_TYPE.GET_NOTE_BY_URL_RESPONSE, payload: notes }
          );
        });
        break;
      case MESSAGE_TYPE.EXPORT_INDEXEDDB:
        let exportData = {
          notes: await noteRepo.getAll(),
        };
        downloadFile(
          `page-note-export-${Date.now()}.json`,
          exportData);
        break;
      case MESSAGE_TYPE.IMPORT_INDEXEDDB:
        noteRepo.clear();
        noteRepo.bulkInsert(msg.payload.notes);
        chromeSendMessage(MESSAGE_TYPE.GET_ALL_NOTE_RESPONSE, await noteRepo.getAll());
        break;
      case MESSAGE_TYPE.AUTO_SUMMARIZATION:
        const {text, lineNumber, separator} = msg.payload;
        let summarizationResponse = {};
        try {
          const summariedText = await autoSummarization(text, lineNumber, separator);
          // TODO: utilに書き出し
          summarizationResponse = {
            status: "success",
            text: summariedText
          }
        } catch(err) {
          summarizationResponse = {
            status: "failure",
            text: err.message
          }
        }
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { type: MESSAGE_TYPE.AUTO_SUMMARIZATION_RESPONSE, payload: summarizationResponse }
          );
        });
        break;
    }
  });

  // TODO: デバッグ用
  chrome.tabs.create({ url: "src/notelist/index.html" });
  // chrome.tabs.create({ url: "src/editnote/index.html?id=2" });
  // noteRepo.insert("example.URL", "title", "se", "selected text", "summary", "boyd", ["tag", "tag1"], "red");
  // noteRepo.insert("example.URL", "title", "se", "selected text", "summary", "boyd", ["tag", "tag1"], "purple");
  // noteRepo.insert("example.URL", "title", "se", "selected text", "summary", "boyd", ["tag", "tag1"], "blue");
});


/**
 * DBの定義
 */
function createDB() {
  let conn = new Dexie(DB_INFO.NAME);
  // TODO: できるならtagsとlabelを外部キーで管理したい欲
  // REF: definition scheme: https://dexie.org/docs/Version/Version.stores()
  conn.version(DB_INFO.VERSION).stores({
    notes: "++id,url,title,selector,selectedText,summary,body,tags,label"
  });
  return conn;
}

/**
 * Repository
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

  async getById(id) {
    const result = await this.db.notes.get(id);
    return result;
  }

  async getByURL(url) {
    const result = await this.db.notes.where({ url: url }).toArray();
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
   * 一気に登録する
   * @param {Array<{url, title, selector, selectedText, summary, body, tags, label}>} notes 
   */
  async bulkInsert(notes) {
    const result = await this.db.notes.bulkAdd(notes);
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

  /**
   * 全件削除
   */
  async clear() {
    const result = await this.db.notes.clear();
  }
}

/**
 * 自動要約
 * @param {String} text 
 * @param {Number} lineNumber 
 * @param {String} separator 
 * @returns {String}
 * @throws {PageNoteError}
 */
async function autoSummarization(text, lineNumber = 1, separator = "。") {
  const sentences = text
    .split(separator)
    .filter(sentence => sentence !== "");
  if (sentences.length < 2) {
    throw new PageNoteError("only one sentence", "only one sentence. need more 2 sentences");
  }
  if (sentences.length > 10) {
    throw new PageNoteError("too many sentences", "Too many sentences. Please reduce the number of sentences.");
  }
  if (sentences.some(sentence => sentence.length > 200)) {
    throw new PageNoteError("too long sentence is exist", "Too long sentence is exist. Please under 200 characters per sentence.");
  }

  let formdata = new FormData();
  formdata.append("apikey", TEXT_SUMMARIZATION_API.KEY);
  formdata.append("sentences", text);
  formdata.append("linenumber", lineNumber);
  formdata.append("separator", separator);

  const response = await fetch(TEXT_SUMMARIZATION_API.URL, {
    method: TEXT_SUMMARIZATION_API.METHOD,
    body: formdata
  });

  const resJson = await response.json();

  if (resJson.status !== 0) {
    throw new PageNoteError("failed to api call", "Summarization is failure.");
  }
  return resJson.summary.join("。");
}

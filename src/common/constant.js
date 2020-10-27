/**
 * LABEL
 */
export const LABEL_COLOR_CODE = {
  RED: "#ff389b",
  PURPLE: "#9b38ff",
  BLUE: "#389bff",
  GREEN: "#00cc33",
  ORANGE: "#ff9b38",
  DEFALULT: "#ff389b"
};

export const HIGHLIGHT_COLOR_CODE = {
  RED: "#ff9bcd",
  PURPLE: "#cd9bff",
  BLUE: "#9bcdff",
  GREEN: "#7fe599",
  ORANGE: "#ffcd9b",
  DEFALULT: "#ff9bcd"
};

export const LABEL_COLOR = {
  RED: "red",
  PURPLE: "purple",
  BLUE: "blue",
  GREEN: "green",
  ORANGE: "orange"
};

/**
 * message passing
 */
export const MESSAGE_TYPE = {
  OPEN_ADD_NOTE_WINDOW: "OPEN_ADD_NOTE_WINDOW",

  // note
  ADD_NOTE: "ADD_NOTE",
  UPDATE_NOTE_BY_ID: "UPDATE_NOTE_BY_ID",
  DELETE_NOTE_BY_ID: "DELETE_NOTE_BY_ID",
  GET_ALL_NOTE: "GET_ALL_NOTE",
  GET_ALL_NOTE_RESPONSE: "GET_ALL_NOTE_RESPONSE",
  GET_NOTE_BY_ID: "GET_NOTE_BY_ID",
  GET_NOTE_BY_ID_RESPONSE: "GET_NOTE_BY_ID_RESPONSE",
  GET_NOTE_BY_URL: "GET_NOTE_BY_URL",
  GET_NOTE_BY_URL_RESPONSE: "GET_NOTE_BY_URL_RESPONSE",

  // db
  EXPORT_INDEXEDDB: "EXPORT_INDEXEDDB",
  IMPORT_INDEXEDDB: "IMPORT_INDEXEDDB"
};

/**
 * db
 */
export const DB_INFO = {
  VERSION: 1,
  NAME: "pageNote"
};
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

/**
 * images
 */
export const ICON = {
  NOTE: "assets/icons/icon128.png",
  ADD_NOTE: "assets/icons/icon-plus.png",
  CLIP_NOTE: "assets/icons/icon-clip.png",
  CLIP_NOTE_RED: "assets/icons/icon-clip-red.png",
  CLIP_NOTE_PURPLE: "assets/icons/icon-clip-purple.png",
  CLIP_NOTE_GREEN: "assets/icons/icon-clip-green.png",
  CLIP_NOTE_BLUE: "assets/icons/icon-clip-blue.png",
  CLIP_NOTE_ORANGE: "assets/icons/icon-clip-orange.png"
};

/**
 * default options
 */
export const OPTION_KEY = {
  MARK_TEXT: "markText",
  SUMMARIZATION_SEPARATOR: "summarizationSeparator",
  SUMMAEIZATION_PERCENTAGE: "summarizationPercentage"
};

export const DEFAULT_OPTION = {
  markText: true,
  summarizationSeparator: "。",
  summarizationPercentage: 0.1
};
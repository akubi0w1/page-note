export default class PageNoteError extends Error {
  /**
   * 
   * @param {String} error 
   * @param {String} message 
   */
  constructor(error, message) {
    super(error);
    this.message = message;
  }
}
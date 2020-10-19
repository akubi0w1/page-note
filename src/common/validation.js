import PageNoteError from "./error";
import { LABEL_COLOR } from "./constant";

/**
 * 
 * @param {String} summary 
 * @throws {PageNoteError}
 */
export function validateNoteSummary(summary) {
  if (summary === "") {
    throw new PageNoteError("summary is empty", "summary is empty");
  }
}

export function validateNoteBody(body) {
}

/**
 * 
 * @param {String} tag 
 * @throws {PageNoteError}
 */
export function validateTag(tag) {
  if(tag === "") {
    throw new PageNoteError("tag is empty string", "invalid tag");
  }
}

/**
 * 
 * @param {String} label 
 * @throws {PageNoteError}
 */
export function validateLabel(label) {
  if (label != LABEL_COLOR.RED && label != LABEL_COLOR.PURPLE && label != LABEL_COLOR.BLUE && label != LABEL_COLOR.GREEN && label != LABEL_COLOR.ORANGE) {
    throw new PageNoteError("invalid label", "invalid label");
  }
}
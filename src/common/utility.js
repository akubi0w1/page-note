import { MESSAGE_TYPE } from "./constant";

/**
 * runtimeにmessageを送る
 * @param {MESSAGE_TYPE} type 
 * @param {Object} payload 
 */
export function chromeSendMessage(type, payload={}) {
  chrome.runtime.sendMessage({
    type,
    payload
  });
}
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

/**
 * ファイルダウンロード
 * @param {String} filename 
 * @param {String} data 
 * @param {String} blobType 
 */
export function downloadFile(filename, data, blobType="plain/text") {
  const blob = new Blob([JSON.stringify(data)], { type: blobType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.download = filename;
  a.href = url;
  a.click();
  a.remove();
}
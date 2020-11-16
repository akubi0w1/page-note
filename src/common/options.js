export function saveOptions(options = {}) {
  chrome.storage.sync.set(options);
};

export function getAllOptions() {
  chrome.storage.sync.get({
    markText: true
  }, function (result) { console.log(result); });
};

export function getOptionsByKey(key) {
  chrome.storage.sync.get(key, function (result) { console.log(result); });
};

/**
 * restoreする
 * @param {OPTION_KEY} optionKey 
 * @param {Function} callback 
 */
export function restoreOption(optionKey, callback) {
  chrome.storage.sync.get(optionKey, callback);
}
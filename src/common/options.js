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
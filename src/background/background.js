chrome.runtime.onInstalled.addListener(function () {
  // create contextMenu
  chrome.contextMenus.create({
    "id": "pageNoteContextMenu",
    "title": "PageNote",
    "contexts": ["all"],
    "onclick": chrome.contextMenus.onClicked.addListener(function(info, tab) {
      chrome.tabs.get(tab.id, function(tab) {
        chrome.tabs.executeScript(
          tab.id,
          { code: "document.getElementById(\"_page-note-wrapper\").style.display = \"block\";" }
        );
      });
    })
  });
});
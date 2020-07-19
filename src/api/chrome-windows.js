const pLimit = require('p-limit');
const limit = pLimit(2)

const openWindowWithTabs = (tabs) => {
  return new Promise((resolve) => {
    chrome.windows.create({
      "url": tabs[0]
    },(_window) => {
      var openTabs = tabs.slice(1).map((tab) => {
        return limit(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              chrome.tabs.create({'windowId': _window.id, 'url': tab}, () => { resolve(); });
            }, 700);
          });
        });
      })

      Promise.all(openTabs).then(() => {
        resolve();
      });
    });
  });
}

module.exports = {
  name: "chromeWindowsApi",
  openWindowWithTabs({tabs: tabs}) {
    return openWindowWithTabs(tabs);
  }
}
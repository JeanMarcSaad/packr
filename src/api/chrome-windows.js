const pLimit = require('p-limit');
const limit = pLimit(2)

const openWindowWithTabs = (tabs) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.windows.create({
        "url": tabs[0]
      }, (_window) => {
        if (chrome.runtime.lastError) {
          console.error("Error creating window:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }

        var openTabs = tabs.slice(1).map((tab) => {
          return limit(() => {
            return new Promise((resolve) => {
              setTimeout(() => {
                chrome.tabs.create({'windowId': _window.id, 'url': tab}, () => {
                  if (chrome.runtime.lastError) {
                    console.warn(`Error creating tab (${tab}):`, chrome.runtime.lastError);
                    // Continue despite error - don't block other tabs
                  }
                  resolve();
                });
              }, 700);
            });
          });
        })

        Promise.all(openTabs).then(() => {
          resolve();
        }).catch((error) => {
          console.error("Error opening tabs:", error);
          resolve(); // Resolve anyway to prevent hanging
        });
      });
    } catch (error) {
      console.error("Unexpected error in openWindowWithTabs:", error);
      reject(error);
    }
  });
}

module.exports = {
  name: "chromeWindowsApi",
  openWindowWithTabs({tabs: tabs}) {
    return openWindowWithTabs(tabs);
  }
}
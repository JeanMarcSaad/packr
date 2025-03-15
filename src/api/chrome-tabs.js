const getOpenTabs = () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      let openTabs = tabs.map((tab) => {
        if(tab.url && tab.title)
          return {
            "url": tab.url,
            "title": tab.title,
            "favIconUrl": tab.favIconUrl
          }
      });
      openTabs = Array.from(new Set(openTabs));
      resolve(openTabs);
    });
  });
}

const openTab = (url) => {
    return new Promise((resolve) => {
      chrome.tabs.create({'url': url}, () => {
        resolve();
      });
    });
  }

const popupExtension = () => {
  return new Promise((resolve) => {
    chrome.tabs.create({'url': chrome.runtime.getURL('popup.html')}, () => {
      resolve();
    });
  });
}

module.exports = {
  name: "chromeTabsApi",
  getOpenTabs() {
      return getOpenTabs();
  },
  openTab({url: url}) {
    return openTab(url);
  },
  popupExtension() {
    return popupExtension();
  }
}
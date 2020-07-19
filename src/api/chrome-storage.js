const getPacks = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['packs'],(result) => {
      resolve(result.packs?JSON.parse(result.packs):[]);
    });
  });
}

const getPack = (id) => {
  return new Promise((resolve, reject) => {
    getPacks()
    .then((packs) => {
      packs.forEach(pack => {
        if(pack.id == id)
          resolve(pack);
      });
      reject("Pack not found");
    });
  });
}

const addPack = (pack) => {
  return new Promise((resolve) => {
    getPacks()
    .then((packs) => {
      packs.unshift(pack);
      chrome.storage.local.set({packs: JSON.stringify(packs)}, () => {
        resolve(packs);
      });
    });
  });
}

const updatePack = (id, pack) => {
  return new Promise((resolve, reject) => {
    getPacks()
    .then((packs) => {
      let index = packs.findIndex((pack) => pack['id'] == id);
      if(index == -1)
        reject("Pack not found");
      packs[index] = pack;
      chrome.storage.local.set({packs: JSON.stringify(packs)}, () => {
        resolve(packs);
      });
    });
  });
}

const deletePack = (id) => {
  return new Promise((resolve, reject) => {
    getPacks()
    .then((packs) => {
      let index = packs.findIndex((pack) => pack['id'] == id);
      if(index == -1)
        reject("Pack not found");
      packs.splice(index, 1);
      chrome.storage.local.set({packs: JSON.stringify(packs)}, () => {
        resolve(packs);
      });
    });
  });
}

const deleteTab = (id, url) => {
  return new Promise((resolve, reject) => {
    getPack(id)
    .then((pack) => {
      pack.tabs = pack.tabs.filter((tab) => { return tab.url != url });
      updatePack(id, pack)
      .then(() => {
        resolve();
      })
    })
    .catch((err) => {
      console.log(err);
      reject(`Pack with id ${id} not found`);
    })
  });
}

const addTabs = (id, tabs) => {
  return new Promise((resolve, reject) => {
    getPack(id)
    .then((pack) => {
      // TODO Use Set() for Pack tabs
      let urls = pack.tabs.map((tab) => tab.url);
      
      tabs.forEach( (tab) => {
        if(!urls.includes(tab.url)) {
          pack.tabs.push(tab);
        }
      });
      updatePack(id, pack)
      .then(() => {
        resolve();
      })
    })
    .catch((err) => {
      console.log(err);
      reject(`Pack with id ${id} not found`);
    })
  });
}

const updateTab = (id, tab) => {
  return new Promise((resolve, reject) => {
    getPack(id)
    .then((pack) => {
      let curr_tab = pack.tabs.filter((_tab) => _tab.url == tab.url);
      let index = pack.tabs.indexOf(curr_tab[0]);
      pack.tabs[index] = tab;
      updatePack(id, pack)
      .then(() => {
        resolve();
      })
    })
    .catch((err) => {
      console.log(err);
      reject(`Pack with id ${id} not found`)
    })
  })
}

const setOnPacksChanged = (callback) => {
  let _callback = (changes, area) => {
    if (area == "local" && "packs" in changes) {
      callback();
    }
  };
  chrome.storage.onChanged.addListener(_callback);
}

const resetPackr = () => {
  return new Promise((resolve) => {
    chrome.storage.local.set({packs: JSON.stringify([])}, () => {
      resolve();
    });
  });
}

module.exports = {
  name: "chromeStorageApi",
  getPacks() {
    return getPacks();
  },
  getPack({id: id}) {
    return getPack(id);
  },
  addPack({pack: pack}) {
    return addPack(pack);
  },
  updatePack({id: id, pack: pack}) {
    return updatePack(id, pack);
  },
  deletePack({id: id}) {
    return deletePack(id);
  },
  deleteTab({id: id, url: url}) {
    return deleteTab(id, url);
  },
  addTabs({id: id, tabs: tabs}) {
    return addTabs(id, tabs)
  },
  updateTab({id: id, tab: tab}) {
    return updateTab(id, tab);
  },
  setOnPacksChanged({callback: callback}) {
    setOnPacksChanged(callback);
  },
  resetPackr() {
    resetPackr();
  }
}
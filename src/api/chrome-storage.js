const getPacks = async () => {
  const result = await chrome.storage.local.get(['packs']);
  return result.packs ? JSON.parse(result.packs) : [];
}

const getPack = async (id) => {
  const packs = await getPacks();
  const pack = packs.find(pack => pack.id == id);
  if (pack) return pack;
  throw new Error("Pack not found");
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

const exportPacks = () => {
  return new Promise((resolve) => {
    getPacks()
    .then((packs) => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(packs));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);

      // Create timestamp in format YYYY-MM-DD_HH-MM-SS
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

      // Set the filename with timestamp
      downloadAnchorNode.setAttribute("download", `packr_backup_${timestamp}.json`);

      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      resolve(true);
    });
  });
}

const importPacks = (fileContent) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Import function started");
      console.log("FileContent parameter:", fileContent);

      // Get the actual content (the parameter itself is the content)
      const content = fileContent;

      // Check if content is empty
      if (!content || content.trim() === '') {
        console.error("Empty file content");
        reject("Error: Empty file content");
        return;
      }

      // Log the content for debugging
      console.log("Content type:", typeof content);
      console.log("Content first 100 chars:", content.substring(0, 100), "...");
      console.log("Content length:", content.length);

      // Parse the JSON
      let packs;
      try {
        packs = JSON.parse(content);
        console.log("JSON parsed successfully:", typeof packs);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        reject("Invalid JSON format in the backup file");
        return;
      }

      // Validate the imported data structure
      if (!Array.isArray(packs)) {
        console.error("Data is not an array:", typeof packs);
        reject("Invalid backup file format: data must be an array");
        return;
      }

      console.log("Packs array length:", packs.length);

      // Basic validation of pack structure
      if (packs.length > 0) {
        const invalidPacks = packs.filter(pack => !pack.id || !pack.name || !Array.isArray(pack.tabs));
        if (invalidPacks.length > 0) {
          console.error("Some packs have invalid structure:", invalidPacks.length);
          reject("Invalid pack structure in the backup file");
          return;
        }
      }

      console.log("All packs validated successfully, saving to storage...");

      // Save the imported packs
      chrome.storage.local.set({packs: JSON.stringify(packs)}, () => {
        if (chrome.runtime.lastError) {
          console.error("Chrome storage error:", chrome.runtime.lastError);
          reject("Failed to save imported packs: " + chrome.runtime.lastError.message);
          return;
        }

        console.log("Import operation completed successfully, packs saved:", packs.length);

        // Return the imported packs
        resolve(packs);
      });
    } catch (e) {
      console.error("General import error:", e);
      reject("Failed to import packs: " + e.message);
    }
  });
}

const checkFirstRun = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['v3_migrated'], (result) => {
      resolve(result.v3_migrated === true);
    });
  });
}

const setMigrationComplete = () => {
  return new Promise((resolve) => {
    chrome.storage.local.set({v3_migrated: true}, () => {
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
    return resetPackr();
  },
  exportPacks() {
    return exportPacks();
  },
  importPacks({fileContent}) {
    return importPacks(fileContent);
  },
  checkFirstRun() {
    return checkFirstRun();
  },
  setMigrationComplete() {
    return setMigrationComplete();
  }
}
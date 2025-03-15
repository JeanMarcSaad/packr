<template>
  <b-container fluid class="packr-container">
    <b-row>
      <b-col cols="12" class="p-3 packr-header">
        <div class="settings-header">
          <div class="header-left">
            <div class="back-button-wrapper" @click="goBack()">
              <b-icon-arrow-left-circle
                class="back-arrow-outline"
                font-scale="1.5"
              />
              <b-icon-arrow-left-circle-fill
                class="back-arrow-fill"
                font-scale="1.5"
              />
            </div>
          </div>

          <div class="header-title">Settings</div>

          <div class="header-right">
            <b-icon-three-dots-vertical 
              class="menu-icon" 
              font-scale="1.5"
              @click="toggleMenu"
            />
          </div>
        </div>
      </b-col>
    </b-row>

    <!-- Dropdown menu -->
    <div v-if="showMenu" class="settings-menu-dropdown">
      <div class="menu-item" @click="exportPacks">Export Packs</div>
      <div class="menu-item" @click="triggerFileInput">Import Packs</div>
      <div class="menu-item" @click="resetMigrationFlag">Test Migration</div>
    </div>

    <input 
      type="file" 
      id="import-file" 
      accept=".json" 
      style="display: none;" 
      @change="handleFileUpload"
      ref="fileInput"
    />

    <!-- Status message area -->
    <b-row v-if="importMessage">
      <b-col>
        <div :class="['status-message', importStatus]">
          {{ importMessage }}
        </div>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <div class="themes-title">
          Themes
        </div>
      </b-col>
    </b-row>
    <div class="themes-container">
      <b-row v-for="(themes, key) in splitThemes" :key="key" class="theme-row">
        <b-col cols="6" v-for="(theme, _key) in themes" :key="_key" class="theme-column">
          <ThemeSelector :theme="theme" @selected="refreshThemes"/>
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>

<script>
import ThemeSelector from "@/components/ThemeSelector"
import themesApi from "@/api/themes-api"
import chromeStorageApi from '@/api/chrome-storage'

export default {
  name: "SettingsView",
  components: {
    ThemeSelector
  },
  data: () => {
    return {
      themes: themesApi.getThemes(),
      importMessage: '',
      importStatus: '',
      showMenu: false
    }
  },
  created: function() {
    // Check if there was an import in progress when popup closed
    chrome.storage.local.get(['import_in_progress', 'import_status_message', 'import_status_type', 'import_status_timestamp', 'import_status_auto_clear'], (result) => {
      if (result.import_in_progress) {
        // Clear the flag
        chrome.storage.local.remove(['import_in_progress']);
      }

      // Restore any status message that was showing
      if (result.import_status_message) {
        // Calculate how long the message has been displayed
        const currentTime = new Date().getTime();
        const messageAge = result.import_status_timestamp ? currentTime - result.import_status_timestamp : 0;

        // Only show messages that are recent (less than 10 seconds old)
        if (!result.import_status_timestamp || messageAge < 10000) {
          this.importMessage = result.import_status_message;
          this.importStatus = result.import_status_type || 'info';

          // Clear message after display (shorter timeout if it's marked for auto-clear)
          const timeout = result.import_status_auto_clear ? 3000 : 5000;

          setTimeout(() => {
            this.importMessage = '';
            // Clear the status message from storage
            chrome.storage.local.remove([
              'import_status_message', 
              'import_status_type', 
              'import_status_timestamp', 
              'import_status_auto_clear'
            ]);
          }, timeout);
        } else {
          // Message is old, just clear it from storage
          chrome.storage.local.remove([
            'import_status_message', 
            'import_status_type', 
            'import_status_timestamp', 
            'import_status_auto_clear'
          ]);
        }
      }
    });

    // Listen for messages from the background script
    this.messageListener = (message) => {
      console.log("Received message in popup:", message);

      if (message.action === "refresh_packs") {
        console.log("Refreshing packs display");
        // Refresh the UI if needed
      }
    };

    chrome.runtime.onMessage.addListener(this.messageListener);

    // Add click outside listener to close the menu
    document.addEventListener('click', this.closeMenuOnClickOutside);

    // Set up a timer to check for import status messages
    this.statusCheckInterval = setInterval(() => {
      chrome.storage.local.get(['import_status_message', 'import_status_type', 'import_status_timestamp', 'import_status_auto_clear'], (result) => {
        if (result.import_status_message && !this.importMessage) {
          // Calculate how long the message has been displayed
          const currentTime = new Date().getTime();
          const messageAge = result.import_status_timestamp ? currentTime - result.import_status_timestamp : 0;

          // Only show messages that are recent (less than 10 seconds old)
          if (!result.import_status_timestamp || messageAge < 10000) {
            console.log("Found status message in storage:", result.import_status_message);
            this.importMessage = result.import_status_message;
            this.importStatus = result.import_status_type || 'info';

            // Clear message after display (shorter timeout if it's marked for auto-clear)
            const timeout = result.import_status_auto_clear ? 3000 : 5000;

            setTimeout(() => {
              this.importMessage = '';
              // Clear the status message from storage
              chrome.storage.local.remove([
                'import_status_message', 
                'import_status_type', 
                'import_status_timestamp', 
                'import_status_auto_clear'
              ]);
            }, timeout);
          } else {
            // Message is old, just clear it from storage
            chrome.storage.local.remove([
              'import_status_message', 
              'import_status_type', 
              'import_status_timestamp', 
              'import_status_auto_clear'
            ]);
          }
        }
      });
    }, 1000); // Check every second
  },
  beforeDestroy: function() {
    // Remove event listeners when component is destroyed
    document.removeEventListener('click', this.closeMenuOnClickOutside);
    chrome.runtime.onMessage.removeListener(this.messageListener);

    // Clear interval
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
  },
  computed: {
    splitThemes() {
      let result = [];
      let curr_index = -1;
      this.themes.forEach((element, index) => {
        if(index % 2 == 0) {
          curr_index += 1;
          result[curr_index] = [];
        }
        result[curr_index].push(element);
      });
      return result;
    }
  },
  methods: {
    refreshThemes() {
      this.themes = themesApi.getThemes();
      this.$router.go(-1);
    },
    goBack() {
      this.$router.go(-1);
    },
    toggleMenu(event) {
      // Stop propagation to prevent immediate closing
      event.stopPropagation();
      this.showMenu = !this.showMenu;
    },
    closeMenuOnClickOutside(event) {
      const menuIcon = document.querySelector('.menu-icon');
      if (menuIcon && !menuIcon.contains(event.target) && this.showMenu) {
        this.showMenu = false;
      }
    },
    triggerFileInput() {
      this.showMenu = false; // Close menu

      // Instead of triggering the file input in the popup,
      // we'll request the background script to open the import page
      chrome.runtime.sendMessage({
        action: "open_import_page"
      });
    },
    exportPacks() {
      this.showMenu = false; // Close menu
      try {
        chromeStorageApi.exportPacks();
      } catch (err) {
        console.error("Export error:", err);
        this.showStatusMessage("Error exporting packs", "error");
      }
    },
    handleFileUpload(event) {
      event.preventDefault(); // Prevent default form submission

      const file = event.target.files[0];
      if (!file) {
        chrome.storage.local.remove(['import_in_progress']);
        return;
      }

      console.log("File selected:", file.name);

      try {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const content = e.target.result;
            console.log("File read successfully, content length:", content.length);

            // Send the file content to the background script
            chrome.runtime.sendMessage({
              action: "import_file",
              fileContent: content
            }, (response) => {
              console.log("Background script response:", response);
              // The background script will handle everything, including setting status messages
            });

            // Display a message to the user that the import is in progress
            this.showStatusMessage("Import in progress...", "info");

          } catch (error) {
            console.error("File processing error:", error);
            chrome.storage.local.remove(['import_in_progress']);
            this.showStatusMessage(`Error processing file: ${error.message}`, "error");
          }
        };

        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          chrome.storage.local.remove(['import_in_progress']);
          this.showStatusMessage("Failed to read file", "error");
        };

        reader.readAsText(file);
      } catch (e) {
        console.error("General file handling error:", e);
        chrome.storage.local.remove(['import_in_progress']);
        this.showStatusMessage(`Error: ${e.message}`, "error");
      }

      // Reset the file input so the same file can be selected again
      event.target.value = '';
    },

    showStatusMessage(message, status) {
      this.importMessage = message;
      this.importStatus = status;

      // Add timestamp for status message expiration
      const timestamp = new Date().getTime();

      // Store the status message in storage so it persists if popup closes
      chrome.storage.local.set({
        import_status_message: message,
        import_status_type: status,
        import_status_timestamp: timestamp
      });

      setTimeout(() => {
        this.importMessage = '';
        // Clear the status message from storage
        chrome.storage.local.remove([
          'import_status_message', 
          'import_status_type', 
          'import_status_timestamp', 
          'import_status_auto_clear'
        ]);
      }, 5000);
    },

    resetMigrationFlag() {
      this.showMenu = false; // Close menu
      chrome.storage.local.remove(['v3_migrated'], () => {
        if (chrome.runtime.lastError) {
          console.error('Error clearing migration flag:', chrome.runtime.lastError);
        } else {
          alert('Migration flag cleared. Reload the extension to see the welcome screen.');
          // Show current storage state after clearing
          this.showStorageState();
        }
      });
    },

    // Helper to see what's in storage
    showStorageState() {
      chrome.storage.local.get(null, (items) => {
        console.log('Current storage state:', items);
        if (items.v3_migrated) {
          console.log('Migration flag: Set (welcome screen will NOT show)');
        } else {
          console.log('Migration flag: NOT set (welcome screen WILL show)');
        }
        if (items.packs) {
          const packs = JSON.parse(items.packs);
          console.log(`Found ${packs.length} packs in storage`);
        } else {
          console.log('No packs found in storage');
        }
      });
    }
  }
}
</script>

<style>
/* Header layout */
.settings-header {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.header-left, .header-right {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
}

.header-left {
  justify-content: flex-start;
}

.header-right {
  justify-content: flex-end;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 14pt;
}

.back-arrow-icon {
  cursor: pointer;
  color: #333;
}

.back-arrow-outline, 
.back-arrow-fill {
  cursor: pointer;
  color: #333;
}

.menu-icon {
  cursor: pointer;
  color: #333;
}

/* Custom dropdown menu */
.settings-menu-dropdown {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 160px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  border-radius: 4px;
  z-index: 1000;
  overflow: hidden;
}

.menu-item {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: rgba(0,0,0,0.05);
}

.menu-item:active {
  background-color: rgba(0,0,0,0.1);
}

/* Status message */
.status-message {
  padding: 10px 20px;
  border-radius: 8px;
  text-align: center;
  font-size: 11pt;
  margin: 5px auto 15px auto;
  max-width: 90%;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.status-message.success {
  background-color: rgba(46, 204, 113, 0.2);
  color: #27ae60;
  border: 1px solid rgba(46, 204, 113, 0.5);
}

.status-message.error {
  background-color: rgba(231, 76, 60, 0.2);
  color: #c0392b;
  border: 1px solid rgba(231, 76, 60, 0.5);
}

.themes-title {
  user-select: none;
  margin: 5px 13px 15px 13px;
  font-size: 13pt;
  text-decoration: underline;
  text-decoration-color: rgba(0,0,0,0.3);
  text-underline-position: under;
}

.themes-container {
  width: 90%;
  margin: 0 auto;
  padding: 0 10px;
}

.theme-row {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 10px;
}

.theme-column {
  display: flex;
  justify-content: center;
  padding: 0 5px;
}
</style>

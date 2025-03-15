// Background script for Packr extension
// Handles communication between components and maintains state

// Keep track of pending operations
let pendingOperations = {
  fileImportPending: false
};

// Helper function to safely send messages
function sendMessageSafely(message) {
  try {
    // Wrap in a try-catch block first
    chrome.runtime.sendMessage(message, response => {
      // Check for runtime error
      if (chrome.runtime.lastError) {
        console.log("Message sending produced an error: ", chrome.runtime.lastError.message);
        // This is expected sometimes, we can ignore it
      }
    });
  } catch (e) {
    console.log("Error sending message:", e);
    // We can safely ignore this error
  }
}

// Function to handle file imports
function handleFileImport(fileContent) {
  console.log("Background script handling file import");

  // Parse and validate the file content
  try {
    if (!fileContent || fileContent.trim() === '') {
      console.error("Empty file content");
      const timestamp = new Date().getTime();
      chrome.storage.local.set({
        import_status_message: "Error: Empty file content",
        import_status_type: "error",
        import_status_timestamp: timestamp
      });
      return { success: false, error: "Empty file content" };
    }

    console.log("Content length:", fileContent.length);

    // Parse JSON
    let packs;
    try {
      packs = JSON.parse(fileContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      const timestamp = new Date().getTime();
      chrome.storage.local.set({
        import_status_message: "Invalid JSON format in the backup file",
        import_status_type: "error",
        import_status_timestamp: timestamp
      });
      return { success: false, error: "Invalid JSON format" };
    }

    // Validate the imported data structure
    if (!Array.isArray(packs)) {
      console.error("Data is not an array:", typeof packs);
      const timestamp = new Date().getTime();
      chrome.storage.local.set({
        import_status_message: "Invalid backup file format: data must be an array",
        import_status_type: "error",
        import_status_timestamp: timestamp
      });
      return { success: false, error: "Invalid backup format" };
    }

    // Basic validation of pack structure
    if (packs.length > 0) {
      const invalidPacks = packs.filter(pack => !pack.id || !pack.name || !Array.isArray(pack.tabs));
      if (invalidPacks.length > 0) {
        console.error("Some packs have invalid structure");
        const timestamp = new Date().getTime();
        chrome.storage.local.set({
          import_status_message: "Invalid pack structure in the backup file",
          import_status_type: "error",
          import_status_timestamp: timestamp
        });
        return { success: false, error: "Invalid pack structure" };
      }
    }

    // Save the imported packs
    return new Promise((resolve) => {
      chrome.storage.local.set({packs: JSON.stringify(packs)}, () => {
        if (chrome.runtime.lastError) {
          console.error("Chrome storage error:", chrome.runtime.lastError);
          const timestamp = new Date().getTime();
          chrome.storage.local.set({
            import_status_message: "Failed to save imported packs: " + chrome.runtime.lastError.message,
            import_status_type: "error",
            import_status_timestamp: timestamp
          });
          resolve({ success: false, error: chrome.runtime.lastError.message });
          return;
        }

        console.log("Import operation completed successfully, packs saved:", packs.length);

        // Set success message
        const successMessage = `Successfully imported ${packs.length} packs!`;
        const timestamp = new Date().getTime();
        chrome.storage.local.set({
          import_status_message: successMessage,
          import_status_type: "success",
          import_status_timestamp: timestamp,
          import_status_auto_clear: true
        });

        // Notify all open extension views that packs have been updated
        // Use the safe message sending function to avoid errors
        sendMessageSafely({action: "refresh_packs"});

        resolve({ success: true, packCount: packs.length, message: successMessage });
      });
    });
  } catch (e) {
    console.error("General import error:", e);
    const timestamp = new Date().getTime();
    chrome.storage.local.set({
      import_status_message: "Failed to import packs: " + e.message,
      import_status_type: "error",
      import_status_timestamp: timestamp
    });
    return { success: false, error: e.message };
  }
}

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background script received message:", request);

  if (request.action === "packs_updated") {
    // Notify all open extension views that packs have been updated
    // Use the safe message sending function to avoid errors
    sendMessageSafely({action: "refresh_packs"});
    return true;
  }

  if (request.action === "import_file") {
    console.log("Received file import request");

    // Mark that we're handling an import
    pendingOperations.fileImportPending = true;

    // Process the file content
    if (request.fileContent) {
      // Handle the import and send response
      const importResult = handleFileImport(request.fileContent);

      // Check if the result is a promise
      if (importResult instanceof Promise) {
        importResult.then(result => {
          sendResponse(result);
          pendingOperations.fileImportPending = false;
        }).catch(err => {
          console.error("Error in import promise:", err);
          // Make sure we still send a response even if there's an error
          sendResponse({success: false, error: err.message || "Unknown error"});
          pendingOperations.fileImportPending = false;
        });
        return true; // Keep the channel open for the async response
      } else {
        // Synchronous result
        sendResponse(importResult);
        pendingOperations.fileImportPending = false;
        return true;
      }
    } else {
      console.error("No file content received");
      const timestamp = new Date().getTime();
      chrome.storage.local.set({
        import_status_message: "Error: No file content provided",
        import_status_type: "error",
        import_status_timestamp: timestamp
      });
      sendResponse({success: false, error: "No file content provided"});
      pendingOperations.fileImportPending = false;
      return true;
    }
  }

  if (request.action === "open_import_page") {
    console.log("Opening import page");
    // Use chrome.runtime.getURL to get the correct path to the import.html file
    const importUrl = chrome.runtime.getURL("import.html");
    chrome.tabs.create({ url: importUrl });
    return true;
  }

  // Always return true for async message handling
  return true;
});

// Set up listeners when extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed or updated:", details.reason);

  // Check for migration flags if this is an update
  if (details.reason === "update") {
    console.log("This is an update, will check migration status");
  }
});

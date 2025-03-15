// Import page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const mainContainer = document.getElementById('main-container');
  const backButton = document.getElementById('back-button');
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  const statusMessage = document.getElementById('status-message');
  const closeBtn = document.getElementById('close-btn');
  const loading = document.getElementById('loading');

  // Get the current theme from Chrome storage
  chrome.storage.local.get(['packr_theme'], (result) => {
    if (result.packr_theme) {
      try {
        const theme = JSON.parse(result.packr_theme);
        // Add the theme class to the body
        if (theme && theme.class) {
          mainContainer.classList.add(theme.class);
          console.log('Applied theme:', theme.class);
        }
      } catch (e) {
        console.error('Error parsing theme:', e);
      }
    }
  });

  // Handle back button
  backButton.addEventListener('click', function() {
    // Clear any status messages from storage before closing
    chrome.storage.local.remove(['import_status_message', 'import_status_type']);
    window.close();
  });

  // Handle clicks on the upload area
  uploadArea.addEventListener('click', function(e) {
    // Prevent click from reaching the input directly
    if (e.target !== fileInput) {
      e.preventDefault();
      fileInput.click();
    }
  });

  // Handle file selection
  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    processFile(file);
  });

  // Handle drag and drop
  uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.8)';
    uploadArea.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  });

  uploadArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.4)';
    uploadArea.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  });

  uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.4)';
    uploadArea.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';

    const file = e.dataTransfer.files[0];
    if (!file) return;

    processFile(file);
  });

  // Close button handler
  closeBtn.addEventListener('click', function() {
    // Clear any status messages from storage before closing
    chrome.storage.local.remove(['import_status_message', 'import_status_type']);
    window.close();
  });

  // Process the file and send to background script
  function processFile(file) {
    showStatus('Reading file...', 'info');
    showLoading(true);

    // Validate the file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      showStatus('Error: Please select a JSON file', 'error');
      showLoading(false);
      return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
      try {
        const content = e.target.result;
        console.log("File read successfully, content length:", content.length);

        if (!content || content.trim() === '') {
          showStatus('Error: File is empty', 'error');
          showLoading(false);
          return;
        }

        showStatus('Processing and importing...', 'info');

        // Send the file content to the background script
        chrome.runtime.sendMessage({
          action: "import_file",
          fileContent: content
        }, function(response) {
          showLoading(false);
          console.log("Background script response:", response);

          if (response && response.success) {
            // Show success message with auto-close after 3 seconds
            showStatus(`Success! Imported ${response.packCount} packs.`, 'success');

            // Set a flag to indicate this message should auto-clear
            chrome.storage.local.set({ 'import_status_auto_clear': true });

            // Auto-close window after 3 seconds on success
            setTimeout(() => {
              chrome.storage.local.remove(['import_status_message', 'import_status_type', 'import_status_auto_clear']);
              window.close();
            }, 3000);
          } else if (response && response.error) {
            showStatus(`Error: ${response.error}`, 'error');
          } else {
            showStatus('There was a problem with the import. Please try again.', 'error');
          }
        });
      } catch (error) {
        showLoading(false);
        console.error("File processing error:", error);
        showStatus(`Error processing file: ${error.message}`, 'error');
      }
    };

    reader.onerror = function(error) {
      showLoading(false);
      console.error("FileReader error:", error);
      showStatus("Failed to read file", 'error');
    };

    reader.readAsText(file);
  }

  // Show status message
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
    statusMessage.style.display = 'block';

    // Add timestamp to the status message to help with state management
    const timestamp = new Date().getTime();

    // Also store in chrome storage for the popup to pick up
    chrome.storage.local.set({
      import_status_message: message,
      import_status_type: type,
      import_status_timestamp: timestamp
    });
  }

  // Show/hide loading spinner
  function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
  }

  // Check for status messages in storage on load
  chrome.storage.local.get(['import_status_message', 'import_status_type'], function(result) {
    if (result.import_status_message) {
      showStatus(result.import_status_message, result.import_status_type || 'info');
    }
  });
}); 
const fs = require('fs');
const path = require('path');

// Define paths
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Files to copy
const filesToCopy = [
  'import.html',
  'import.js',
  'background.js'
];

// Copy each file
filesToCopy.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const distPath = path.join(distDir, file);

  try {
    // Check if source file exists
    if (fs.existsSync(srcPath)) {
      // Read the file to make sure it's complete and valid
      const fileContent = fs.readFileSync(srcPath, 'utf8');

      // Simple validation check - for JS files, ensure no syntax errors
      if (file.endsWith('.js')) {
        try {
          // This will throw an error if there's a syntax issue
          new Function(fileContent);
          console.log(`✅ Validated ${file} - no syntax errors`);
        } catch (syntaxError) {
          console.error(`❌ Syntax error in ${file}:`, syntaxError.message);
          // Continue with the copy anyway, but log the error
        }
      }

      // Copy the file
      fs.writeFileSync(distPath, fileContent, 'utf8');
      console.log(`✅ Successfully copied ${file} to dist directory`);
    } else {
      console.error(`❌ Source file ${file} not found in src directory`);
    }
  } catch (error) {
    console.error(`❌ Error copying ${file}:`, error.message);
  }
});

// Update manifest.json to include import.html as a web_accessible_resource
try {
  const manifestPath = path.join(distDir, 'manifest.json');

  // Check if manifest file exists
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ manifest.json not found in dist directory');
    return;
  }

  const manifestContent = fs.readFileSync(manifestPath, 'utf8');

  // Validate JSON format
  let manifest;
  try {
    manifest = JSON.parse(manifestContent);
  } catch (jsonError) {
    console.error('❌ manifest.json is not valid JSON:', jsonError.message);
    return;
  }

  // Ensure web_accessible_resources exists and is in the correct format for Manifest V3
  if (!manifest.web_accessible_resources) {
    manifest.web_accessible_resources = [];
  }

  // Check if it's an array (for Manifest V2) or an array of objects (for Manifest V3)
  if (Array.isArray(manifest.web_accessible_resources) && 
      manifest.web_accessible_resources.length > 0 && 
      typeof manifest.web_accessible_resources[0] === 'object') {
    // Manifest V3 format
    let resourceEntry = manifest.web_accessible_resources.find(entry => entry.resources && Array.isArray(entry.resources));

    if (!resourceEntry) {
      resourceEntry = {
        resources: ['import.html', 'import.js'],
        matches: ['<all_urls>']
      };
      manifest.web_accessible_resources.push(resourceEntry);
    } else {
      // Check if each resource is already included, add if not
      ['import.html', 'import.js'].forEach(resource => {
        if (!resourceEntry.resources.includes(resource)) {
          resourceEntry.resources.push(resource);
        }
      });
    }
  } else {
    // Convert to Manifest V3 format if needed
    const resources = Array.isArray(manifest.web_accessible_resources) 
      ? manifest.web_accessible_resources 
      : [];

    // Add resources if they don't exist
    ['import.html', 'import.js'].forEach(resource => {
      if (!resources.includes(resource)) {
        resources.push(resource);
      }
    });

    manifest.web_accessible_resources = [{
      resources: resources,
      matches: ['<all_urls>']
    }];
  }

  // Write the updated manifest back to the file
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✅ Manifest updated to include import files');

  // Double-check that the background.js reference is correct in the manifest
  if (manifest.manifest_version === 3) {
    if (!manifest.background || !manifest.background.service_worker || manifest.background.service_worker !== 'background.js') {
      console.log('⚠️ Fixing background service worker reference in manifest');
      manifest.background = {
        service_worker: 'background.js'
      };
      // Write the updated manifest again
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    }
  } else {
    // For Manifest V2, check background scripts
    if (!manifest.background || (!manifest.background.scripts || !manifest.background.scripts.includes('background.js'))) {
      console.log('⚠️ Fixing background scripts reference in manifest');
      manifest.background = manifest.background || {};
      manifest.background.scripts = manifest.background.scripts || [];
      if (!manifest.background.scripts.includes('background.js')) {
        manifest.background.scripts.push('background.js');
      }
      // Write the updated manifest again
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    }
  }

  console.log('✅ Manifest validation complete');

} catch (error) {
  console.error('❌ Error updating manifest:', error.message);
} 
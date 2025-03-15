const fs = require('fs');
const path = require('path');

// Read the manifest file
const manifestPath = path.join(__dirname, 'dist', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Convert the CSP string to the proper Manifest V3 format
if (typeof manifest.content_security_policy === 'string') {
  const cspValue = manifest.content_security_policy;
  delete manifest.content_security_policy;

  // Create the new CSP object structure
  manifest.content_security_policy = {
    extension_pages: cspValue
  };
}

// Write the updated manifest back to the file
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('✅ Manifest CSP format has been fixed for Manifest V3'); 
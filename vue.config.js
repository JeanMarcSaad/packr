module.exports = {
  "pages": {
    "popup": {
      "template": "public/browser-extension.html",
      "entry": "./src/popup/main.js",
      "title": "Packr"
    }
  },
  "pluginOptions": {
    "browserExtension": {
      "componentOptions": {
        "background": {
          "entry": "src/background.js"
        }
      }
    }
  }
}
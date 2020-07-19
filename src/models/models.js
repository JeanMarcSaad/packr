const { v4: uuidv4 } = require('uuid');

export class Pack {
  id;
  name;
  tabs;
  bookmarked;

  constructor(name, tabs) {
    this.id = uuidv4();
    this.name = name;
    this.tabs = tabs;
    this.bookmarked = false;
  }
}

export class Tab {
  url;
  favicon;
  title;

  constructor(url, favicon, title) {
    this.url = url;
    this.favicon=favicon?favicon:require("@/assets/img/broken_link.png");
    this.title=title?title:undefined;
  }
}
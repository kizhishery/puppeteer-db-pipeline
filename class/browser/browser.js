const { Page } = require('../page/page');
const { BrowserLauncher, PageRegistry } = require('./browserManagerClass');

class Browser {
  // ✅ Singleton instance
  static instance;

  constructor() {
    if (Browser.instance) {
      return Browser.instance; // prevent multiple instances
    }
    this.pageRegistry = new PageRegistry();
    Browser.instance = this;
  }

  // ✅ Static method to get singleton
  static getInstance() {
    if (!Browser.instance) {
      Browser.instance = new Browser();
    }
    return Browser.instance;
  }

  async createPage(pageId) {
    const browser = await BrowserLauncher.getBrowser();
    const page = new Page(browser, pageId);
    this.pageRegistry.addPage(pageId, page);
    return page;
  }

  getPage(pageId) {
    return this.pageRegistry.getPage(pageId);
  }

  async closePage(pageId) {
    await this.pageRegistry.closePage(pageId);
  }

  async closeBrowser() {
    await this.pageRegistry.closeAllPages();
    await BrowserLauncher.closeBrowser();
  }
}

module.exports = { Browser };


const { Page } = require('./page');
const { BrowserLauncher, PageRegistry } = require('./browserManagerClass');

class Browser {
  constructor() {
    this.pageRegistry = new PageRegistry();
  }

  async createPage(pageId) {
    const browser = await BrowserLauncher.getBrowser();
    const page = new Page(browser,pageId);
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

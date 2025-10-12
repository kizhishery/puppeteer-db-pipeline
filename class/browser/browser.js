const { Page } = require('./page');
const { BrowserLauncher, PageRegistry } = require('./browserManagerClass');

class Browser {
  constructor() {
    this.pageRegistry = new PageRegistry();
  }

  async createPage(pageId) {
    const browser = await BrowserLauncher.getBrowser();
    const pageWrapper = new Page(browser);
    this.pageRegistry.addPage(pageId, pageWrapper);
    return pageWrapper;
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

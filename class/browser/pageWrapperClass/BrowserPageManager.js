class BrowserPageManager {
  constructor(browser) {
    this.browser = browser;
    this.page = null;
  }

  async init() {
    if (this.page && !this.page.isClosed()) return this.page;
    this.page = await this.browser.newPage();
    return this.page;
  }

  async close() {
    if (this.page && !this.page.isClosed()) {
      try {
        await this.page.close();
      } catch {}
    }
    this.page = null;
  }

  isReady() {
    return this.page && !this.page.isClosed();
  }
}

module.exports = { BrowserPageManager };

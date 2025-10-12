const { BrowserPageManager, CookieManager, ApiFetcher } = require('./pageWrapperClass');

class Page {
  constructor(browser) {
    this.pageManager = new BrowserPageManager(browser);
    this.cookieManager = null;
    this.apiFetcher = null;
  }

  async preparePage(pageURL, useCookies = false) {
    const page = await this.pageManager.init();
    await page.goto(pageURL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    if (useCookies) {
      this.cookieManager = new CookieManager(page);
      await this.cookieManager.fetchCookies();
    }

    this.apiFetcher = new ApiFetcher(page, this.cookieManager);
  }

  async fetchData(pageURL, apiURL, useCookies = false, retries = 2) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await this.preparePage(pageURL, useCookies);
        return await this.apiFetcher.fetch(apiURL);
      } catch (err) {
        console.warn(`fetchData attempt ${attempt + 1} failed: ${err.message}`);
        await this.pageManager.close();
        if (attempt === retries - 1) throw err;
      }
    }
  }

  async close() {
    await this.pageManager.close();
  }
}

module.exports = { Page };

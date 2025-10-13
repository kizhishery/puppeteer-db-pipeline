// const { data1, data2 } = require("../../dataClass");
const { Expiry } = require('../expiry/expiryClass'); // import Expiry class
const { EXCHANGE, BASE_URL, BASE_URL_2 } = require('../../constants');
const { BrowserPageManager, CookieManager, ApiFetcher } = require('./pageWrapperClass');

class Page {
  constructor(browser, exchange) {
    this.pageManager = new BrowserPageManager(browser);
    this.apiFetcher = null;

    this.attr = { exchange, cookieManager: null };
    this.arr = { expiry: [], expiryURL: [] };
    this.page = { expiryPage: null, activePage: null };
    this.api = { expiryApi: null, activeApi: null, futureApi: null };
    this.data = { current : [], next : []}
  }

  async preparePage(pageURL) {
    const page = await this.pageManager.init();
    await page.goto(pageURL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    this.attr.cookieManager = new CookieManager(page);
    await this.attr.cookieManager.fetchCookies();

    this.apiFetcher = new ApiFetcher(page, this.attr.cookieManager);
  }

  // Single API fetch for expiry page
  async fetchExpiry(retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await this.preparePage(this.page.expiryPage);
        return await this.apiFetcher.fetch(this.api.expiryApi);
      } catch (err) {
        console.warn(`fetchExpiry attempt ${attempt + 1} failed: ${err.message}`);
        await this.pageManager.close();
        if (attempt === retries - 1) throw err;
      }
    }
  }

  // Fetch options concurrently for first 2 expiry dates
  async fetchOptions() {
    if (!this.arr.expiry || this.arr.expiry.length === 0) return [];

    const optionApis = this.arr.expiry.slice(0, 2).map(date =>
      this.buildUrl(date, this.attr.exchange)
    );

    await this.preparePage(this.page.expiryPage);

    const [current, next] = await Promise.all(
      optionApis.map(url => this.apiFetcher.fetch(url))
    );

    this.data.current = current, this.data.next = next;
  }

  // Combined getExpiry that internally calls fetchExpiry
  async getExpiry() {
    const data = await this.fetchExpiry();
    const expiry = new Expiry(data, this.attr.exchange);
    this.arr.expiry = expiry.getExpiry();
    return this.arr.expiry;
  }

  // Generate expiry URLs after getting expiry dates
  async buildExpiry() {
    await this.getExpiry();
    this.arr.expiryURL = this.arr.expiry.map(date =>
      this.buildUrl(date, this.attr.exchange)
    );
  }

  // Helper to set pages and APIs
  buildAttr(pageURL, expiryApi, activePage, activeApi, futureApi = null) {
    this.page.expiryPage = pageURL;
    this.page.activePage = activePage;
    this.api.expiryApi = expiryApi;
    this.api.activeApi = activeApi;
    this.api.futureApi = futureApi;
  }

  // Build URL from date and exchange
  buildUrl(date, exchange) {
    if (exchange === EXCHANGE) return `${BASE_URL}${encodeURIComponent(date)}`;
    return `${BASE_URL_2}?Expiry=${encodeURIComponent(date)}&scrip_cd=1&strprice=0`;
  }

  async close() {
    await this.pageManager.close();
  }
}

module.exports = { Page };

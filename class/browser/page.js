// const { data1, data2 } = require("../../dataClass");
const { Expiry } = require('../expiry/expiryClass');
const { DynamoInserter } = require('../db/dynamoDbClass');
const { Processor } = require('../processor/processorClass');
const { EXCHANGE, BASE_URL, BASE_URL_2 } = require('../../constants');
const { BrowserPageManager, CookieManager, ApiFetcher } = require('./pageWrapperClass');

class Page {
  constructor(browser, exchange) {
    this.pageManager = new BrowserPageManager(browser);
    this.pageInstance = null; // 🔹 Puppeteer page instance (reused)
    this.apiFetcher = null;

    this.attr = { exchange , cookieManager: null, table : null };
    this.arr = { expiry: [], expiryURL: [] };
    this.page = { expiryPage: null, activePage: null };
    this.api = { expiryApi: null, activeApi: null, futureApi: null };
    this.data = { current: [], next: [] };
    this.compressed = {};
  }

  // 🔹 Initialize once and reuse
  async initPage() {
    if (!this.pageInstance) {
      this.pageInstance = await this.pageManager.init();
      console.log(`📄 Page initialized for ${this.attr.exchange}`);
    }
  }

  async preparePage(pageURL) {
    await this.initPage(); // ensure pageInstance exists

    const page = this.pageInstance;

    await page.goto(pageURL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Create CookieManager & ApiFetcher only once per page
    if (!this.attr.cookieManager) {
      this.attr.cookieManager = new CookieManager(page);
      await this.attr.cookieManager.fetchCookies();
    }

    if (!this.apiFetcher) {
      this.apiFetcher = new ApiFetcher(page, this.attr.cookieManager);
    }
  }

  // 🔹 Fetch expiry API (uses same page)
  async fetchExpiry(retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await this.preparePage(this.page.expiryPage);
        return await this.apiFetcher.fetch(this.api.expiryApi);
      } catch (err) {
        console.warn(`fetchExpiry attempt ${attempt + 1} failed: ${err.message}`);
        if (attempt === retries - 1) throw err;
      }
    }
  }

  // 🔹 Fetch option data concurrently (for first 2 expiries)
  async fetchOptions() {
    if (!this.arr.expiry?.length) return [];

    const optionUrls = this.arr.expiry.slice(0, 2).map(date =>
      this.buildUrl(date, this.attr.exchange)
    );

    await this.preparePage(this.page.expiryPage);

    const [current, next] = await Promise.all(
      optionUrls.map(url => this.apiFetcher.fetch(url))
    );

    this.data.current = current;
    this.data.next = next;
  }

  async getExpiry() {
    const data = await this.fetchExpiry();
    const expiry = new Expiry(data, this.attr.exchange);
    this.arr.expiry = expiry.getExpiry();
    return this.arr.expiry;
  }

  async buildExpiry() {
    await this.getExpiry();
    this.arr.expiryURL = this.arr.expiry.map(date =>
      this.buildUrl(date, this.attr.exchange)
    );
  }

  buildAttr(pageURL, expiryApi, activePage, activeApi, futureApi, table) {
    this.attr.table = table;
    this.api.expiryApi = expiryApi;
    this.api.activeApi = activeApi;
    this.api.futureApi = futureApi;
    this.page.expiryPage = pageURL;
    this.page.activePage = activePage;
  }

  buildUrl(date, exchange) {
    if (exchange === EXCHANGE) return `${BASE_URL}${encodeURIComponent(date)}`;
    return `${BASE_URL_2}?Expiry=${encodeURIComponent(date)}&scrip_cd=1&strprice=0`;
  }

  getCompressed() {
    const args = {attr : this.attr, data : this.data}
    const object = new Processor(args).process();
    this.compressed = object;
  }

  async insertIntoDB() {
    const { current, next } = this.compressed
    
    const insertNext = new DynamoInserter(next,this.attr.table).insertAll();
    const insertCurrent = new DynamoInserter(current,this.attr.table).insertAll();

    await Promise.all([
      insertCurrent,insertNext
    ]);
  }
  
  async close() {
    if (this.pageInstance) await this.pageInstance.close();
    await this.pageManager.close();
    console.log(`🧹 Closed page for ${this.attr.exchange}`);
  }
}

module.exports = { Page };

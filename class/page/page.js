const { Expiry } = require("../expiry/expiryClass");
const { DynamoInserter } = require("../db/dynamoDbClass");
const { Processor } = require("../processor/processorClass");
const { EXCHANGE, BASE_URL, BASE_URL_2 } = require("../../constants");
const {
  BrowserPageManager,
  CookieManager,
  ApiFetcher,
} = require("./pageWrapperClass");

class Page {
  constructor(browser, exchange) {
    this.pageManager = new BrowserPageManager(browser);
    this.apiFetcher = null;

    this.attr = {
      exchange,
      cookieManager: null,
      table: null,
    };

    this.arr = { expiry: [], expiryURL: [] };
    this.page = { expiryPage: null, activePage: null };
    this.api = { expiryApi: null, activeApi: null, futureApi: null };
    this.data = { current: [], next: [], active: [], future: [] };
    this.compressed = {};

    this.pageInstances = {}; // ✅ store multiple prepared Puppeteer pages
  }

  /** ✅ Create both expiry and active pages immediately */
  async initAllPages() {
    const browser = this.pageManager.browser;

    if (!this.page.expiryPage || !this.page.activePage) {
      console.warn(
        "⚠️ Page URLs not yet assigned in buildAttr() — skipping initAllPages()"
      );
      return;
    }

    // Create expiry tab
    if (!this.pageInstances.expiry) {
      this.pageInstances.expiry = await browser.newPage();
      console.log(`📄 Created expiry page for ${this.attr.exchange}`);
    }

    // Create active tab
    if (!this.pageInstances.active) {
      this.pageInstances.active = await browser.newPage();
      console.log(`📄 Created active page for ${this.attr.exchange}`);
    }
  }

  /** ✅ Build attributes for this page */
  buildAttr(expiryPage, expiryApi, activePage, activeApi, futureApi, table) {
    Object.assign(this.attr, { table });
    Object.assign(this.api, { expiryApi, activeApi, futureApi });
    Object.assign(this.page, { expiryPage, activePage });
  }

  /** ✅ Prepare one of the pre-created pages (no recreation) */
  /** 🔹 Identify which pre-created page key to use */
  getPageKey(pageURL) {
    if (pageURL === this.page.expiryPage) return "expiry";
    if (pageURL === this.page.activePage) return "active";
    return null;
  }

  /** 🔹 Handle navigation separately */
  async navigatePage(page, pageURL) {
    let exchange = this.attr.exchange === EXCHANGE;
    // Choose appropriate waitUntil mode
    const waitUntil = exchange ? "networkidle2" : "";

    try {
      if (exchange) {
        await page.goto(pageURL, { waitUntil, timeout: 30_000 });
      } else {
        await page.goto(pageURL, { timeout: 30_000 });
      }

      console.log(`🌐 Navigated to ${pageURL} for ${this.attr.exchange}`);
    } catch (err) {
      console.warn(`⚠️ Navigation warning at ${pageURL}: ${err.message}`);
    }
  }

  /** 🔹 Prepare a page instance (uses getPageKey + navigatePage) */
  async preparePage(pageURL) {
    const pageKey = this.getPageKey(pageURL);

    if (!pageKey || !this.pageInstances[pageKey]) {
      throw new Error(`No pre-created page instance found for URL: ${pageURL}`);
    }

    const page = this.pageInstances[pageKey];
    const alreadyReady =
      this.apiFetcher && this.attr.cookieManager && page.url() === pageURL;

    if (!alreadyReady) {
      await this.navigatePage(page, pageURL);
      await this.initDependencies(page);
    }
  }

  /** ✅ Initialize dependencies only once per page */
  async initDependencies(page) {
    if (!this.attr.cookieManager) {
      this.attr.cookieManager = new CookieManager(page);
      await this.attr.cookieManager.fetchCookies();
    }

    if (!this.apiFetcher) {
      this.apiFetcher = new ApiFetcher(page, this.attr.cookieManager);
    }
  }

  /** ✅ Prepare both expiry and active pages before fetching */
  async prepareAllPages() {
    const pagesToPrepare = [this.page.expiryPage, this.page.activePage].filter(
      Boolean
    );
    await Promise.all(pagesToPrepare.map((url) => this.preparePage(url)));
    console.log(
      `✅ Prepared both expiry & active pages for ${this.attr.exchange}`
    );
  }

  /** 🔹 Fetch expiry data (with retries) */
  async fetchExpiry(retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // ✅ prepare both pages before fetching
        await this.prepareAllPages();
        return await this.apiFetcher.fetch(this.api.expiryApi);
      } catch (err) {
        console.warn(
          `⚠️ fetchExpiry attempt ${attempt} failed: ${err.message}`
        );
        if (attempt === retries) throw err;
      }
    }
  }

  /** 🔹 Fetch options for current and next expiry */
  async fetchOptions() {
    if (!this.arr.expiry?.length) return [];

    await this.preparePage(this.page.expiryPage);

    const optionUrls = this.arr.expiry.map((date) =>
      this.buildUrl(date, this.attr.exchange)
    );

    const [current, next] = await Promise.all(
      optionUrls.map((url) => this.apiFetcher.fetch(url))
    );

    Object.assign(this.data, { current, next });
  }

  /** 🔹 Fetch only active data */
  async fetchActiveData() {
    if (!this.api.activeApi) return [];

    await this.preparePage(this.page.activePage);

    const [active] = await Promise.all([
      this.apiFetcher.fetch(this.api.activeApi),
    ]);

    Object.assign(this.data, { active });
  }

  /** 🔹 Fetch both active and future data (for non-primary exchanges) */
  async fetchActiveAndFutureData() {
    if (!this.api.activeApi || !this.api.futureApi) return [];

    await this.preparePage(this.page.activePage);

    const [active, future] = await Promise.all([
      this.apiFetcher.fetch(this.api.activeApi),
      this.apiFetcher.fetch(this.api.futureApi),
    ]);

    Object.assign(this.data, { active, future });
  }

  /** 🔹 Wrapper to choose correct fetch type */
  async fetchOtherData() {
    if (this.attr.exchange === EXCHANGE) {
      await this.fetchActiveData();
    } else {
      await this.fetchActiveAndFutureData();
    }
  }

  /** 🔹 Fetch and process expiry list */
  async getExpiry() {
    const rawData = await this.fetchExpiry();
    const expiry = new Expiry(rawData, this.attr.exchange);
    this.arr.expiry = expiry.getExpiry();
    return this.arr.expiry;
  }

  /** 🔹 Build expiry URLs after fetching expiry dates */
  async buildExpiry() {
    await this.getExpiry();
    this.arr.expiryURL = this.arr.expiry.map((date) =>
      this.buildUrl(date, this.attr.exchange)
    );
  }

  /** 🔹 Construct expiry URL */
  buildUrl(date, exchange) {
    return exchange === EXCHANGE
      ? `${BASE_URL}${encodeURIComponent(date)}`
      : `${BASE_URL_2}?Expiry=${encodeURIComponent(
          date
        )}&scrip_cd=1&strprice=0`;
  }

  /** 🔹 Process data into compressed format */
  getCompressed() {
    // debugger;
    const args = { attr: this.attr, data: this.data };
    this.compressed = new Processor(args).process();
  }

  /** 🔹 Insert processed data into DynamoDB */
  async insertIntoDB() {
    await Promise.all(
      Object.values(this.compressed)
        .filter(Boolean)
        .map((data) => {
          const dbWriter = new DynamoInserter(data, this.attr.table);
          return Array.isArray(data) ? dbWriter.insertAll() : dbWriter.insert();
        })
    );

    console.log(`💾 Inserted data into ${this.attr.table}`);
  }

  /** 🔹 Gracefully close all tabs */
  async close() {
    try {
      for (const [key, page] of Object.entries(this.pageInstances)) {
        if (page && !page.isClosed()) {
          await page.close();
          console.log(`🧹 Closed ${key} page for ${this.attr.exchange}`);
        }
      }
      await this.pageManager.close();
    } catch (err) {
      console.error(
        `❌ Error closing page for ${this.attr.exchange}:`,
        err.message
      );
    }
  }
}

module.exports = { Page };

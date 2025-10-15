const { Expiry } = require('../expiry/expiryClass');
const { DynamoInserter } = require('../db/dynamoDbClass');
const { Processor } = require('../processor/processorClass');
const { EXCHANGE, BASE_URL, BASE_URL_2 } = require('../../constants');
const { BrowserPageManager, CookieManager, ApiFetcher } = require('./pageWrapperClass');

class Page {
  constructor(browser, exchange) {
    this.pageManager = new BrowserPageManager(browser);
    this.pageInstance = null;
    this.apiFetcher = null;

    this.attr = {
      exchange,
      cookieManager: null,
      table: null,
    };

    this.arr = { expiry: [], expiryURL: [] };
    this.page = { expiryPage: null, activePage: null };
    this.api = { expiryApi: null, activeApi: null, futureApi: null };
    this.data = { current: [], next: [], future: [], active : [] };
    this.compressed = {};
  }

  /** ✅ Initialize Puppeteer page once */
  async initPage() {
    if (!this.pageInstance) {
      this.pageInstance = await this.pageManager.init();
      console.log(`📄 Page initialized for ${this.attr.exchange}`);
    }
  }

  /** ✅ Initialize CookieManager & ApiFetcher once */
  async initDependencies(page) {
    if (!this.attr.cookieManager) {
      this.attr.cookieManager = new CookieManager(page);
      await this.attr.cookieManager.fetchCookies();
    }

    if (!this.apiFetcher) {
      this.apiFetcher = new ApiFetcher(page, this.attr.cookieManager);
    }
  }
  
  /** ✅ Prepare page — safely skips if already ready */
  async preparePage(pageURL) {
    await this.initPage();
    
    const page = this.pageInstance;
    
    // Skip reload if same URL & already initialized
    const alreadyReady =
    this.apiFetcher && this.attr.cookieManager && page.url() === pageURL;
    
    if (alreadyReady) return;

    await page.goto(pageURL, { waitUntil: 'networkidle2', timeout: 300000 });
    await this.initDependencies(page);
  }

  /** 🔹 Configure all attributes for this page */
  buildAttr(pageURL, expiryApi, activePage, activeApi, futureApi, table) {
    Object.assign(this.attr, { table });
    Object.assign(this.api, { expiryApi, activeApi, futureApi });
    Object.assign(this.page, { expiryPage: pageURL, activePage });
  }
  /** 🔹 Fetch expiry data (with retries) */
  async fetchExpiry(retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.preparePage(this.page.expiryPage);
        return await this.apiFetcher.fetch(this.api.expiryApi);
      } catch (err) {
        console.warn(`⚠️ fetchExpiry attempt ${attempt} failed: ${err.message}`);
        if (attempt === retries) throw err;
      }
    }
  }

  /** 🔹 Fetch options for current and next expiry */
  async fetchOptions() {
    if (!this.arr.expiry?.length) return [];

    await this.preparePage(this.page.expiryPage);

    const optionUrls = this.arr.expiry
      .map(date => this.buildUrl(date, this.attr.exchange));

    const [current, next] = await Promise.all(
      optionUrls.map(url => this.apiFetcher.fetch(url))
    );

    // this.data = { current, next };
    Object.assign(this.data,{current,next});
  }

  async fetchOtherData() {
    if(this.api.activeApi == null) return [];
  
    await this.preparePage(this.page.activePage);
    
    // debugger;
    if(this.attr.exchange == EXCHANGE) {
      const [ active ] = await Promise.all([
        this.apiFetcher.fetch(this.api.activeApi),
      ]);
      Object.assign(this.data,{active});
    }
    else {
      const [active, future] = await Promise.all([
        this.apiFetcher.fetch(this.api.activeApi),
        this.apiFetcher.fetch(this.api.futureApi),
      ]);
      Object.assign(this.data,{active, future});
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
    this.arr.expiryURL = this.arr.expiry.map(date =>
      this.buildUrl(date, this.attr.exchange)
    );
  }


  /** 🔹 Construct expiry URL */
  buildUrl(date, exchange) {
    return exchange === EXCHANGE
      ? `${BASE_URL}${encodeURIComponent(date)}`
      : `${BASE_URL_2}?Expiry=${encodeURIComponent(date)}&scrip_cd=1&strprice=0`;
  }

  /** 🔹 Process data into compressed format */
  getCompressed() {
    // debugger;
    const args = { attr: this.attr, data: this.data };
    this.compressed = new Processor(args).process();
  }

  /** 🔹 Insert processed data into DynamoDB */
  async insertIntoDB() {
    const { current, next } = this.compressed;

    await Promise.all([
      new DynamoInserter(next, this.attr.table).insertAll(),
      new DynamoInserter(current, this.attr.table).insertAll(),
    ]);

    console.log(`💾 Inserted data into ${this.attr.table}`);
  }

  /** 🔹 Gracefully close page */
  async close() {
    try {
      if (this.pageInstance) 
        await this.pageInstance.close();
      await this.pageManager.close();
      console.log(`🧹 Closed page for ${this.attr.exchange}`);
    } 
    catch (err) {
      console.error(`❌ Error closing page for ${this.attr.exchange}:`, err.message);
    }
  }
}

module.exports = { Page };

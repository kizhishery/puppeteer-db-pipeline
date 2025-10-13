const { Expiry } = require('../expiry/expiryClass'); // import Expiry class
const { data1, data2 } = require("../../dataClass");
const { EXCHANGE, BASE_URL, BASE_URL_2 } = require('../../constants');
const { BrowserPageManager, CookieManager, ApiFetcher } = require('./pageWrapperClass');
class Page {
  constructor(browser, exchange) {
    this.pageManager = new BrowserPageManager(browser);
    this.cookieManager = null;
    this.apiFetcher = null;
    this.attr = {
      exchange : exchange
    }
    this.arr = {
      expiry : [],
      expiryURL : []
    };
    this.page = {
      expiryPage : null,
      activePage : null
    };
    this.api = {
      activeApi : null,
      expiryApi : null,
      activeApi : null,
      futureApi : null
    }
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

  async fetchData(pageURL, expiryApi, useCookies = false, retries = 2) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await this.preparePage(pageURL, useCookies);
        return await this.apiFetcher.fetch(expiryApi);
      } catch (err) {
        console.warn(`fetchData attempt ${attempt + 1} failed: ${err.message}`);
        await this.pageManager.close();
        if (attempt === retries - 1) throw err;
      }
    }
  }

  // ✅ Combined getExpiry() that includes fetchData internally
  async getExpiry(pageURL, expiryApi, useCookies) {
    this.page.expiryPage = pageURL, this.api.expiryApi = expiryApi;
    // const data = await this.fetchData(pageURL, expiryApi, useCookies, retries = 2);
    const data = this.attr.exchange === EXCHANGE ? data1 : data2;
    // debugger;
    const expiry = new Expiry(data, this.attr.exchange);
    this.arr.expiry = expiry.getExpiry();
  }
  
  async buildExpiry(pageURL,expiryApi,useCookies = false) {
    await this.getExpiry(pageURL,expiryApi,useCookies);

    this.arr.expiryURL = this.arr.expiry.map(url => this.buildUrl(url,this.attr.exchange));
  }

  buildUrl(date,exchange) {
    let url;
    if(exchange == EXCHANGE)
        url = `${BASE_URL}${encodeURIComponent(date)}`;
    else 
        url = `${BASE_URL_2}?Expiry=${encodeURIComponent(date)}&scrip_cd=1&strprice=0`;
    // debugger
    return url;
  }

  buildAttr(activePage,activeApi,futureApi = false) {
    this.page.activePage = activePage;
    this.api.activeApi = activeApi;
    this.api.futureApi = futureApi; 
  }

  async close() {
    await this.pageManager.close();
  }
}

module.exports = { Page };

// utils/workFlowUtils.js

const {
  GET_API_FUTURE_2,
  EXCHANGE, EXCHANGE2,
  GET_API_1, GET_API_2,
  PAGE_URL_1, PAGE_URL_2,
  GET_API_ACTIVE_1, GET_API_ACTIVE_2,
  PAGE_ACTIVE_URL_1, PAGE_ACTIVE_URL_2,
} = require('../constants');

class WorkFlowUtils {
  constructor(browser) {
    this.browser = browser;
    this.pages = {};
  }

  /** Create both pages concurrently */
  async createPages() {
    // initate seperatly else race condition creates two seperate browser instances
    // seperate page for exchange 1 (main page)
    const pageExchange_1 = await this.browser.createPage(EXCHANGE);
    // seperate page for exchange 2 (main page)
    const pageExchange2_1 = await this.browser.createPage(EXCHANGE2);

    Object.assign(this.pages,{pageExchange_1,pageExchange2_1});
    // this.pages = {pageExchange_1 : pageExchange_1,pageExchange2_1 : pageExchange2_1} ;
  }

  /** Set up attributes for both pages */
  async insertAttr() {
    const {pageExchange_1 : page1, pageExchange2_1 : page2} = this.pages;
    
    await Promise.all([
      page1.buildAttr(PAGE_URL_1, GET_API_1, PAGE_ACTIVE_URL_1, GET_API_ACTIVE_1, null),
      page2.buildAttr(PAGE_URL_2, GET_API_2, PAGE_ACTIVE_URL_2, GET_API_ACTIVE_2, GET_API_FUTURE_2),
    ]);

    // debugger
      // ✅ Initialize Puppeteer tabs right after setting up URLs
    await Promise.all([
      page1.initAllPages(),
      page2.initAllPages(),
    ]);

  }
  
  /** Build expiry data */
  async buildExpiry() {
    
    const {pageExchange_1 : page1, pageExchange2_1 : page2} = this.pages;
    
    await Promise.all([
      page1.buildExpiry(),
      page2.buildExpiry(),
    ]);
  }
  
  async prepareAllPages() {
    const {pageExchange_1 : page1, pageExchange2_1 : page2} = this.pages;

    await Promise.all([
      page1.prepareAllPages(),
      page2.prepareAllPages()
    ])
  }
  
  /** Fetch options concurrently */
  async fetchOptions() {
    // debugger;
    
    const {pageExchange_1 : page1, pageExchange2_1 : page2} = this.pages;
    
    await Promise.all([
      page1.fetchOptions(),
      page2.fetchOptions(),
    ]);
    
  }
  
  async fetchOtherData() {
    const {pageExchange_1 : page1, pageExchange2_1 : page2} = this.pages;
    // wait for pages to build then cache be used
    await Promise.all([
      page1.fetchOtherData(),
      page2.fetchOtherData()
    ]);
  }
  
  /** Compress data */
  async getCompressed() {
    const {pageExchange_1 : page1, pageExchange2_1 : page2} = this.pages;
    
    await Promise.all([
      page1.getCompressed(),
      page2.getCompressed(),
    ]);
  }
  
  /** Insert results into DB */
  async insertIntoDB() {
    // debugger;

    const {pageExchange_1 : page1, pageExchange2_1 : page2} = this.pages;
    
    await Promise.all([
      page1.insertIntoDB(),
      page2.insertIntoDB(),
    ]);
  }

  /** Cleanup */
  async closeAll() {
    await Promise.allSettled([
      this.browser.closePage(EXCHANGE),
      this.browser.closePage(EXCHANGE2),
    ]);
  }
}

module.exports = { WorkFlowUtils };

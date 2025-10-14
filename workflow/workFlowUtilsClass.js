// utils/workFlowUtils.js

const {
  EXCHANGE, EXCHANGE2,
  DYNAMO_DB_TABLE_1, DYNAMO_DB_TABLE_2,
  PAGE_URL_1, PAGE_URL_2,
  PAGE_ACTIVE_URL_1, PAGE_ACTIVE_URL_2,
  GET_API_1, GET_API_2,
  GET_API_ACTIVE_1, GET_API_ACTIVE_2,
  GET_API_FUTURE_2
} = require('../constants');

class WorkFlowUtils {
  constructor(browser) {
    this.browser = browser;
    this.page1 = null;
    this.page2 = null;
  }

  /** Create both pages concurrently */
  async createPages() {
    const [page1, page2] = await Promise.all([
      this.browser.createPage(EXCHANGE),
      this.browser.createPage(EXCHANGE2),
    ]);
    this.page1 = page1;
    this.page2 = page2;
  }

  /** Set up attributes for both pages */
  async insertAttr() {
    await Promise.all([
      this.page1.buildAttr(PAGE_URL_1, GET_API_1, PAGE_ACTIVE_URL_1, GET_API_ACTIVE_1, null, DYNAMO_DB_TABLE_1),
      this.page2.buildAttr(PAGE_URL_2, GET_API_2, PAGE_ACTIVE_URL_2, GET_API_ACTIVE_2, GET_API_FUTURE_2, DYNAMO_DB_TABLE_2),
    ]);
  }

  /** Build expiry data */
  async buildExpiry() {
    await Promise.all([
      this.page1.buildExpiry(),
      this.page2.buildExpiry(),
    ]);
  }

  /** Fetch options concurrently */
  async fetchOptions() {
    await Promise.all([
      this.page1.fetchOptions(),
      this.page2.fetchOptions(),
    ]);
  }

  /** Compress data */
  async getCompressed() {
    await Promise.all([
      this.page1.getCompressed(),
      this.page2.getCompressed(),
    ]);
  }

  /** Insert results into DB */
  async insertIntoDB() {
    await Promise.all([
      this.page1.insertIntoDB(),
      this.page2.insertIntoDB(),
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

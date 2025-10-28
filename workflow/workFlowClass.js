// class/workFlow.js
const { WorkFlowUtils } = require("./workFlowUtilsClass");

class WorkFlow {
  static instance = null;

  constructor(browser) {
    this.utils = new WorkFlowUtils(browser);
  }

  static getInstance(browser) {
    if (!WorkFlow.instance) {
      WorkFlow.instance = new WorkFlow(browser);
    }
    return WorkFlow.instance;
  }

  arePagesCached() {
    const {
      pages: { pageExchange_1: page1, pageExchange2_1: page2 },
    } = this.utils;
    return page1 != null && page2 != null;
  }

  /**
   * 🔴 Centralized Error Handler
   */
  async error(err) {
    const { message, stack } = err;
    console.error({
      origin: "./workflow/workFlowClass.js",
      status: "❌ Workflow Failed",
      message,
      stack,
    });

    try {
      // Graceful cleanup
      await this.utils.closeAll();
      console.log("☠️ All pages closed");

      const { pages } = this.utils;
      
      pages.pageExchange_1 = null;
      pages.pageExchange_2 = null;

      if (this.utils.browser) {
        await this.utils.browser.closeBrowser();
        console.log("☠️ Browser closed");
      }
    } catch (cleanupErr) {
      console.error("⚠️ Cleanup failed:", cleanupErr.message);
    }
  }

  async run() {
    console.time("🌐 Total Workflow");

    try {
      console.time("🌐 Page Setup");
      await this.utils.createPages();
      await this.utils.insertAttr();
      console.timeEnd("🌐 Page Setup");

      console.time("🌐 Prepare pages");
      await this.utils.prepareAllPages();
      console.timeEnd("🌐 Prepare pages");

      console.time("🌐 Expiry");
      await this.utils.buildExpiry();
      console.timeEnd("🌐 Expiry");

      console.time("🌐 Options, Future and Active Data");
      await this.utils.fetchOptions();
      console.timeEnd("🌐 Options, Future and Active Data");

      console.time("🌐 Compression");
      await this.utils.getCompressed();
      console.timeEnd("🌐 Compression");

      console.time("🌐 DB Insertion");
      await this.utils.insertIntoDB();
      console.timeEnd("🌐 DB Insertion");
      debugger;
    } catch (err) {
      debugger;
      await this.error(err); // ✅ centralized call
    } finally {
      console.timeEnd("🌐 Total Workflow");
    }
  }

  async cacheRun() {
    if (!this.arePagesCached()) {
      throw new Error("Pages are not initialized. Run full workflow first.");
    }

    console.time("🌐 Total Workflow (Cached)");
    try {
      console.time("🌐 Options, Future and Active Data");
      await this.utils.fetchOptions();
      console.timeEnd("🌐 Options, Future and Active Data");

      console.time("🌐 Compression");
      await this.utils.getCompressed();
      console.timeEnd("🌐 Compression");

      console.time("🌐 DB Insertion");
      await this.utils.insertIntoDB();
      console.timeEnd("🌐 DB Insertion");
      debugger;
    } catch (err) {
      debugger;
      await this.error(err); // ✅ reuse centralized handler
    } finally {
      console.timeEnd("🌐 Total Workflow (Cached)");
    }
  }

  _isLambda() {
    const { AWS_LAMBDA_FUNCTION_NAME: name } = process.env;
    return !!name;
  }

  _injectPages() {
    if (!this._isLambda()) {
      const {
        page1: pageExchange_1,
        page2: pageExchange2_1,
      } = require("../data");
      const { pages } = this.utils;
      Object.assign(pages, { pageExchange_1, pageExchange2_1 });
    }
  }
}

module.exports = { WorkFlow };

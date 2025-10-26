// class/workFlow.js
const { WorkFlowUtils } = require('./workFlowUtilsClass');
class WorkFlow {
  // Singleton 
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
  
  // ✅ Check if all pages are initialized and cached
  arePagesCached() {
    // debugger;
    const { pages : { pageExchange_1 : page1, pageExchange2_1 : page2 } } = this.utils;
    const cache = page1 != null && page2 != null;
    return cache;
  }

  async run() {
    // debugger;
    console.time("🌐 Total Workflow");
    
    try {
      console.time("🌐 Page Setup");
      await this.utils.createPages();
      await this.utils.insertAttr();
      console.timeEnd("🌐 Page Setup");
      
      // debugger;
      console.time("🌐 Expiry");
      await this.utils.buildExpiry();
      console.timeEnd("🌐 Expiry");
      
      console.time("🌐 Prepare pages");
      await this.utils.prepareAllPages()
      console.timeEnd("🌐 Prepare pages");
      
      console.time("🌐 Options Data");
      await this.utils.fetchOptions();
      console.timeEnd("🌐 Options Data");

      console.time("🌐 most active and future");
      await this.utils.fetchOtherData();
      console.timeEnd("🌐 most active and future");
      
      // debugger;
      console.time("🌐 Compression");
      await this.utils.getCompressed();
      console.timeEnd("🌐 Compression");
      
      // debugger;
      console.time("🌐 DB Insertion");
      await this.utils.insertIntoDB();
      console.timeEnd("🌐 DB Insertion");
      
      debugger
    } catch (error) {
      console.error("❌ Workflow failed:", error);
      throw error;
    } 
    finally {
      // await this.utils.closeAll();
      // await this.browser.closeBrowser();
      console.timeEnd("🌐 Total Workflow");
    }
  }
  
  async cacheRun() {
    if (!this.arePagesCached()) {
      throw new Error("Pages are not initialized. Run full workflow first.");
    }
    
    console.time("🌐 Total Workflow (Cached)");
    
    // debugger;
    try {
      console.time("🌐 Options");
      await this.utils.fetchOptions(); // start directly here
      console.timeEnd("🌐 Options");
      
      console.time("🌐 most active and future");
      await this.utils.fetchOtherData();
      console.timeEnd("🌐 most active and future");

      console.time("🌐 Compression");
      await this.utils.getCompressed();
      console.timeEnd("🌐 Compression");
      
      console.time("🌐 DB Insertion");
      await this.utils.insertIntoDB();
      console.timeEnd("🌐 DB Insertion");
      
      debugger;
    } catch (error) {
      debugger;
      console.error("❌ Cached workflow failed:", error);
      throw error;
    } finally {
      console.timeEnd("🌐 Total Workflow (Cached)");
    }
  }
  _isLambda() {
    const { AWS_LAMBDA_FUNCTION_NAME : name } = process.env;
    return name;
  }
  _injectPages() {
    if (! this._isLambda()) {
      const { page1 : pageExchange_1 , page2 : pageExchange2_1 } = require('../data');
      const { pages } = this.utils;
      debugger;
      Object.assign(pages, { pageExchange_1, pageExchange2_1 });
      debugger;
    }
  }
}

module.exports = { WorkFlow };

// class/workFlow.js
const { WorkFlowUtils } = require('./workFlowUtilsClass');
class WorkFlow {
  // Singleton 
  static instance = null;
  
  constructor(browser) {
    this.browser = browser;
    this.utils = new WorkFlowUtils(this.browser);
  }
  
  static getInstance(browser) {
    if (!WorkFlow.instance) {
      WorkFlow.instance = new WorkFlow(browser);
    }
    
    return WorkFlow.instance;
  }
  
  // ✅ Check if all pages are initialized and cached
  arePagesCached() {
    const { page1, page2 } = this.utils;
    const cache = page1 != null && page2 != null;
    return cache;
  }

  async run() {
    console.time("🌐 Total Workflow");
    
    try {
      console.time("🌐 Page Setup");
      await this.utils.createPages();
      await this.utils.insertAttr();
      console.timeEnd("🌐 Page Setup");
      
      console.time("🌐 Expiry");
      await this.utils.buildExpiry();
      console.timeEnd("🌐 Expiry");
      
      console.time("🌐 Options");
      await this.utils.fetchOptions();
      console.timeEnd("🌐 Options");
      
      console.time("🌐 Compression");
      await this.utils.getCompressed();
      console.timeEnd("🌐 Compression");
      
      console.time("🌐 DB Insertion");
      await this.utils.insertIntoDB();
      console.timeEnd("🌐 DB Insertion");
      
      debugger
    } catch (error) {
      console.error("❌ Workflow failed:", error);
      throw error;
    } finally {
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
      
      console.time("🌐 Compression");
      await this.utils.getCompressed();
      console.timeEnd("🌐 Compression");
      
      console.time("🌐 DB Insertion");
      await this.utils.insertIntoDB();
      console.timeEnd("🌐 DB Insertion");
      
      // debugger;
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
      const { page1, page2 } = require('../data');
      debugger;
      Object.assign(this.utils, {page1,page2}); 
      debugger;
    }
  }
}

module.exports = { WorkFlow };

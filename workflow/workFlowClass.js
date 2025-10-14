// class/workFlow.js
const { WorkFlowUtils } = require('./workFlowUtilsClass');

class WorkFlow {
  // Singleton 
  static instance = null;

  constructor(browserManager) {
    this.browserManager = browserManager;
    this.utils = new WorkFlowUtils(this.browserManager);
  }
  
  static getInstance(browserManager) {
    if (!WorkFlow.instance) {
      WorkFlow.instance = new WorkFlow(browserManager);
    }
    return WorkFlow.instance;
  }
  async run() {
    console.time("🌐 Total Workflow");

    try {
      console.time("🌐 Page Setup");
      await this.utils.createPages();
      await this.utils.insertAttr();
      console.timeEnd("🌐 Page Setup");

      console.time("🌐 Expiry & Options");
      await this.utils.buildExpiry();
      await this.utils.fetchOptions();
      console.timeEnd("🌐 Expiry & Options");

      console.time("🌐 Compression & DB Insertion");
      await this.utils.getCompressed();
      await this.utils.insertIntoDB();
      console.timeEnd("🌐 Compression & DB Insertion");

    } catch (error) {
      console.error("❌ Workflow failed:", error);
      throw error;
    } finally {
      await this.utils.closeAll();
      await this.browserManager.closeBrowser();
      console.timeEnd("🌐 Total Workflow");
    }
  }

}

module.exports = { WorkFlow };

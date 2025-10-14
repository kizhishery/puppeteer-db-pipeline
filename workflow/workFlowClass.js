// class/workFlow.js
const { WorkFlowUtils } = require('./workFlowUtilsClass');

class WorkFlow {
  constructor(browserManager) {
    this.browserManager = browserManager;
    this.utils = new WorkFlowUtils(this.browserManager);
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
    } finally {
      await this.utils.closeAll();
      await this.browserManager.closeBrowser();
      console.timeEnd("🌐 Total Workflow");
    }
  }
}

module.exports = { WorkFlow };

const { Browser } = require('./class/browser/browser');
const { WorkFlow } = require('./workFlow');

let workflowInstance = null;
let browserManager = null;

const main = async () => {
  // reuse browser across invocations
  if (!browserManager) 
    browserManager = new Browser();

  // reuse singleton workflow
  if (!workflowInstance) 
    workflowInstance = WorkFlow.getInstance(browserManager);

  try {
    await workflowInstance.run();
    return { status: 'success' };
  } catch (err) {
    console.error('❌ Workflow execution failed:', err);
    throw err;
  }
};

module.exports = { main, browserManager, };
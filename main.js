const { Browser } = require('./class/browser/browser');
const { WorkFlow } = require('./workflow');

let globalWorkFlow, globalBrowser;

const main = async () => {
  // reuse browser across invocations
  if (!globalBrowser) 
    globalBrowser = new Browser();

  // reuse singleton workflow
  if (!globalWorkFlow) 
    globalWorkFlow = WorkFlow.getInstance(globalBrowser);

  try {
    await globalWorkFlow.run();
    return { status: 'success' };
  } catch (err) {
    console.error('❌ Workflow execution failed:', err);
    throw err;
  }
};

module.exports = { main, globalBrowser };
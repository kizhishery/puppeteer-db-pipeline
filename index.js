const { Browser } = require('./class/browser/browser');
const { WorkFlow } = require('./workFlow');

let workflowInstance = null;
let browserManager = null;

/**
 * Core workflow executor
 */
const executeWorkflow = async () => {
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

/**
 * Local execution
 */
const runLocal = async () => {
  console.log('🚀 Running workflow locally...');
  try {
    const result = await executeWorkflow();
    console.log('✅ Workflow completed:', result);
  } catch (err) {
    console.error('❌ Local workflow failed:', err);
  } finally {
    // optionally close browser when running locally
    if (browserManager) await browserManager.closeBrowser();
  }
};

/**
 * Lambda handler
 */
const runLambda = async (event, context) => {
  console.log('⚙️ Lambda invoked with event:', JSON.stringify(event));
  try {
    const result = await executeWorkflow();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Workflow completed successfully',
        result,
      }),
    };
  } catch (err) {
    console.error('❌ Lambda workflow failed:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Workflow failed',
        error: err.message,
      }),
    };
  }
};

// Run locally if executed directly
if (require.main === module) {
  runLocal();
}

// Lambda exports
exports.handler = runLambda;

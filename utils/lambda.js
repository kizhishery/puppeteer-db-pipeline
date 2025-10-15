// index.js
const { main, workflow_inject } = require('./main');

const runLambda = async () => {
  const { workflow, browser } = workflow_inject();

  try {
    // Attempt workflow run
    return await main();
  } catch (err) {
    console.error('❌ Workflow failed:', err);

    try {
      // Cleanup pages and browser before retry
      if (workflow?.utils) await workflow.utils.closeAll();
      if (browser?.closeBrowser) await browser.closeBrowser();
      console.log('♻️ Retrying workflow after cleanup...');

    } 
    catch (retryErr) {
      console.error('❌ Retry failed:', retryErr);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: retryErr.message }),
      };
    }
  }
};

// Graceful shutdown for Lambda container
const gracefulShutdown = async () => {
  console.log('⚡ SIGTERM received: shutting down browser...');
  try {
    const { browser } = workflow_inject();
    if (browser?.closeBrowser) await browser.closeBrowser();
    console.log('✅ Browser closed on SIGTERM.');
  } catch (err) {
    console.error('❌ Error during SIGTERM shutdown:', err);
  }
};

process.once("SIGTERM", gracefulShutdown);

// Export for Lambda
exports.handler = { runLambda };

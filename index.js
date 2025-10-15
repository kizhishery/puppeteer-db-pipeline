// index.js
const { main, workflow_inject } = require('./main');

const runLocal = async (iterations = 2, delay = 1000) => {
  console.log('🚀 Running workflow locally...');
  
  // Ensure browser + workflow are initialized once
  const { workflow } = workflow_inject();

  for (let i = 1; i <= iterations; i++) {
    console.log(`\n🔄 Run #${i}`);
    try {
      await main(); // Will reuse cached browser/workflow if available
    } catch (err) {
      console.error(`❌ Run #${i} failed:`, err);
    }
    if (delay > 0) await new Promise(r => setTimeout(r, delay));
  }

  console.log('\n✅ All local runs completed');
  
  debugger
  // Close all pages and browser after all runs
  await workflow.utils.closeAll();
  await workflow.browserManager.closeBrowser();
};

const runLambda = async () => {
  try {
    await main();
    return { statusCode: 200 };
  } catch (err) {
    console.error('❌ Lambda workflow failed:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// Run locally if executed directly
if (require.main === module) {
  runLocal().catch(console.error);
}

// Lambda handler
exports.handler = runLambda;

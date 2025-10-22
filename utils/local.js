const { ITERATION } = require('../constants');
// runLocal.js
const { main, workflow_inject } = require('./main');

const runLocal = async (delay =  1000) => {
  console.log('🚀 Running workflow locally...');

  // Initialize browser + workflow once
  const { workflow, browser } = workflow_inject();

  for (let i = 0; i < ITERATION; i++) {
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
  await browser.closeBrowser();
};

// Run immediately if script is called directly
if (require.main === module) {
  runLocal().catch(console.error);
}

module.exports = { runLocal };

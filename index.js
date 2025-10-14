const { Browser } = require('./class');
const { WorkFlow } = require('./workflow');

const main = async () => {
  const browserManager = new Browser();
  try {
    const workflow = new WorkFlow(browserManager);
    await workflow.run();
  } catch (err) {
    console.error('❌ Workflow failed:', err);
    throw err;
  } finally {
    await browserManager.closeBrowser();
  }
};

// For local
if (require.main === module) {
  main().catch(console.error);
}

// For AWS Lambda
exports.handler = async () => {
  try {
    await main();
    return { statusCode: 200, body: '✅ Success' };
  } catch (err) {
    console.error('❌ Lambda failed:', err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};

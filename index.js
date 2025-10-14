// main.js
const { Browser } = require('./class');
const { WorkFlow } = require('./workflow');

const main = async () => {
  const browserManager = new Browser();
  const workflow = new WorkFlow(browserManager);
  await workflow.run();
  browserManager.closeBrowser();
};

main();
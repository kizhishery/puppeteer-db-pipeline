// main.js
const { Browser } = require('../class/browser/browser');
const { WorkFlow } = require('../workflow');

let cachedBrowser, cachedWorkflow;

/**
 * Initialize and cache Browser + WorkFlow instances.
 * Returns { browser, workflow }.
 */
const workflow_inject = () => {
  if (!cachedBrowser) 
    cachedBrowser = Browser.getInstance();
  if (!cachedWorkflow) 
    cachedWorkflow = WorkFlow.getInstance(cachedBrowser);
  return { workflow: cachedWorkflow,  browser : cachedBrowser };
};

const main = async () => {
  const { workflow } = workflow_inject();

  if (workflow.arePagesCached()) {
    console.log('⚡ Cached pages detected — running cacheRun()...');
    await workflow.cacheRun();
  } else {
    console.log('🚀 Running full workflow...');
    await workflow.run();
  }

  return { status: 'success' };
};

module.exports = { main, workflow_inject };

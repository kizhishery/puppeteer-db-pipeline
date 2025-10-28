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

  // debugger;
  if (workflow.arePagesCached()) {
    console.log('⚡ Cached pages detected — running cacheRun()...');
    await workflow.cacheRun();
  } 
  else {
    const { utils : { pages }} = workflow;
    console.dir(pages,{length : 3});

    console.log('🚀 Running full workflow...');
    await workflow.run();
  }

  return { status: 200, message : 'success' };
};

module.exports = { main, workflow_inject };

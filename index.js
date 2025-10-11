const { PAGE_URL_1, PAGE_URL_2, GET_API_1, GET_API_2 } = require("./constants");
const { runCLI, getBrowser, insertAllData, handleExpiryCache, processFetchedData } = require('./header');

let globalBrowser = null, cachedExpiry = null;

async function main() {
  try {
    // ✅ Ensure browser is alive
    console.time("🌐 Browser Initiated");
    if (!globalBrowser || !globalBrowser.isConnected()) {
      globalBrowser = await getBrowser();
    }
    console.timeEnd("🌐 Browser Initiated");

    // ✅ Handle expiry caching (memoization)
    console.time("🌐 cached expiry");
    cachedExpiry = await handleExpiryCache(globalBrowser, cachedExpiry, PAGE_URL_1, GET_API_1);
    console.timeEnd("🌐 cached expiry");
    
    // ✅ Process all data (fetch + transform)
    console.time("🌐 Data process");
    const processedData = await processFetchedData(globalBrowser, PAGE_URL_1, PAGE_URL_2, cachedExpiry, GET_API_2);
    console.timeEnd("🌐 Data process");
    
    // ✅ Insert everything into DynamoDB
    console.time("🌐 insertion");
    await insertAllData(processedData);
    console.timeEnd("🌐 insertion");
    
    // debugger;

    return { status: 200 };
  } 
  catch (err) {
    console.error("Main error:", err);
    if (globalBrowser && !globalBrowser.isConnected()) globalBrowser = null;
    throw err;
  }
}

// ✅ Graceful shutdown (for Lambda container)
process.once("SIGTERM", async () => {
  if (globalBrowser && globalBrowser.isConnected()) {
    await globalBrowser.close();
    globalBrowser = null;
  }
});

// ✅ CLI
if (require.main === module) {
  runCLI(main, globalBrowser);
}

// ✅ Lambda handler
exports.handler = async (event) => main();

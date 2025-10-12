const { runCLI, getBrowser, insertAllData, handleExpiryCache, processFetchedData } = require('./header');
const { PAGE_URL_1, PAGE_URL_2,PAGE_ACTIVE_URL_1,PAGE_ACTIVE_URL_2,GET_API_1, GET_API_2,GET_API_ACTIVE_1,GET_API_ACTIVE_2,EXCHANGE,EXCHANGE2, GET_API_FUTURE_2,DYNAMO_DB_TABLE_1,DYNAMO_DB_TABLE_2} = require("./constants");

let globalBrowser = null, globalBrowser2 = null, cachedExpiry = null, cachedExpiry2 = null;

async function main() {
  try {
    // ✅ Ensure browser is alive
    console.time("🌐 Browser Initiated");
    if (!globalBrowser || !globalBrowser.isConnected()) {
      globalBrowser = await getBrowser();
    }
    if (!globalBrowser2 || !globalBrowser2.isConnected()) {
      globalBrowser2 = await getBrowser();
    }
    console.timeEnd("🌐 Browser Initiated");

    // ✅ Handle expiry caching (memoization)
    console.time("🌐 cached expiry | Data process 1");
    cachedExpiry = await handleExpiryCache(globalBrowser, cachedExpiry, PAGE_URL_1, GET_API_1, EXCHANGE);
    cachedExpiry2 = await handleExpiryCache(globalBrowser2, cachedExpiry2, PAGE_URL_2, GET_API_2, EXCHANGE2);
    console.timeEnd("🌐 cached expiry | Data process 1");
    
    // ✅ Process all data (fetch + transform)
    console.time("🌐 cached expiry | Data process 2");
    const processedData = await processFetchedData(globalBrowser, PAGE_URL_1, PAGE_ACTIVE_URL_1, cachedExpiry, GET_API_ACTIVE_1,EXCHANGE,GET_API_FUTURE_2);
    const processedData2 = await processFetchedData(globalBrowser2, PAGE_URL_2, PAGE_ACTIVE_URL_2, cachedExpiry2, GET_API_ACTIVE_2,EXCHANGE2,GET_API_FUTURE_2);
    console.timeEnd("🌐 cached expiry | Data process 2");
    
    debugger;
    // ✅ Insert everything into DynamoDB
    console.time("🌐 insertion");
    // debugger
    Promise.all(
      await insertAllData(processedData,DYNAMO_DB_TABLE_1),
      await insertAllData(processedData2,DYNAMO_DB_TABLE_2)
    );
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

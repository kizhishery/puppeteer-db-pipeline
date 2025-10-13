const {
  PAGE_URL_1,
  PAGE_URL_2,
  PAGE_ACTIVE_URL_1,
  PAGE_ACTIVE_URL_2,
  GET_API_1,
  GET_API_2,
  GET_API_ACTIVE_1,
  GET_API_ACTIVE_2,
  EXCHANGE,
  EXCHANGE2,
  GET_API_FUTURE_2,
  DYNAMO_DB_TABLE_1,
  DYNAMO_DB_TABLE_2
} = require("./constants");

const { Browser } = require("./class");
// const { obj1, obj2 } = require('./dataClass');
const browserManager = new Browser();

const main = async () => {
  try {
    console.time("🌐 Browser Initiated");    // Create pages concurrently
    const [page1, page2] = await Promise.all([
      browserManager.createPage(EXCHANGE),
      browserManager.createPage(EXCHANGE2),
    ]);
    console.timeEnd("🌐 Browser Initiated");
    
    console.time("🌐 Set Attributes");    // Create pages concurrently
    // Set attributes (synchronous)
    page1.buildAttr(PAGE_URL_1, GET_API_1, PAGE_ACTIVE_URL_1, GET_API_ACTIVE_1,null,DYNAMO_DB_TABLE_1);
    page2.buildAttr(PAGE_URL_2, GET_API_2, PAGE_ACTIVE_URL_2, GET_API_ACTIVE_2, GET_API_FUTURE_2,DYNAMO_DB_TABLE_2);
    console.timeEnd("🌐 Set Attributes");

    // Fetch expiry dates concurrently
    console.time("🌐 get expiry")
    await Promise.all([
      page1.buildExpiry(),
      page2.buildExpiry(),
    ]);
    console.timeEnd("🌐 get expiry")
    
    // Optionally, fetch options if implemented
    console.time("🌐 fetch expiry")
    await Promise.all([
      page1.fetchOptions(),
      page2.fetchOptions(),
    ]);
    console.timeEnd("🌐 fetch expiry")
    
    // get compressed data
    console.time("🌐 compression")
    page1.getCompressed();
    page2.getCompressed();
    console.timeEnd("🌐 compression")
    
    // data
    // const data1 = obj1;
    // const data2 = obj2;
    console.time("🌐 insertion");
    await Promise.all([
      page1.insertIntoDB(),
      page2.insertIntoDB()
    ]);
    console.timeEnd("🌐 insertion");

    debugger;
  } finally {
    // Close pages when done
    await Promise.allSettled([
      browserManager.closePage(EXCHANGE),
      browserManager.closePage(EXCHANGE2),
    ]);

    // Close browser
    await browserManager.closeBrowser();
  }
};

main();


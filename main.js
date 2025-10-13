const {
  runCLI,
  getBrowser,
  insertAllData,
  handleExpiryCache,
  processFetchedData,
} = require("./header");
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
  DYNAMO_DB_TABLE_2,
  COOKIE_ENABLED,
  COOKIE_DISABLED,
} = require("./constants");

const { Browser, OptionChainParent, Processor } = require("./class");
const { obj1, obj2 } = require('./dataClass');
const browserManager = new Browser();

const main = async () => {
  try {
    // Create pages concurrently
    const [page1, page2] = await Promise.all([
      browserManager.createPage(EXCHANGE),
      browserManager.createPage(EXCHANGE2),
    ]);

    // Set attributes (synchronous)
    page1.buildAttr(PAGE_URL_1, GET_API_1, PAGE_ACTIVE_URL_1, GET_API_ACTIVE_1);
    page2.buildAttr(PAGE_URL_2, GET_API_2, PAGE_ACTIVE_URL_2, GET_API_ACTIVE_2, GET_API_FUTURE_2);

    // Fetch expiry dates concurrently
    // await Promise.all([
    //   page1.buildExpiry(),
    //   page2.buildExpiry(),
    // ]);

    // Optionally, fetch options if implemented
    // await Promise.all([
    //   page1.fetchOptions(),
    //   page2.fetchOptions(),
    // ]);

    // const obj1 = new Processor(page1).process();
    // const obj2 = new Processor(page2).process();
    const data1 = obj1;
    const data2 = obj2;

    debugger;
  } finally {
    // Close pages when done
    await Promise.allSettled([
      // browserManager.closePage(EXCHANGE),
      browserManager.closePage(EXCHANGE2),
    ]);

    // Close browser
    await browserManager.closeBrowser();
  }
};

main();


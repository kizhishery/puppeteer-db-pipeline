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
} = require("./constants");

const { Browser } = require("./class");

const browserManager = new Browser();

const main = async () => {
  const [page1, page2] = await Promise.all([
    browserManager.createPage(EXCHANGE),
    browserManager.createPage(EXCHANGE2),
  ]);

  // ✅ Directly get expiry from each page
  await Promise.all([
    page1.buildExpiry(PAGE_URL_1, GET_API_1, true),
    page2.buildExpiry(PAGE_URL_2, GET_API_2, true),
  ]);

  Promise.all([
    page1.buildAttr(PAGE_ACTIVE_URL_1,GET_API_ACTIVE_1),
    page2.buildAttr(PAGE_ACTIVE_URL_2,GET_API_ACTIVE_2,GET_API_FUTURE_2)
  ])
  // Close pages when done
  await Promise.allSettled([
    browserManager.closePage(EXCHANGE),
    browserManager.closePage(EXCHANGE2),
  ]);

  debugger;
  // Close browser
  await browserManager.closeBrowser();
};

main();

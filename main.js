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

const { Browser, ExpiryOne, ExpiryTwo } = require("./class");
const { data1, data2 } = require('./dataClass');

const browserManager = new Browser();

const main = async () => {
  const [page1, page2] = await Promise.all([
    browserManager.createPage(EXCHANGE),
    browserManager.createPage(EXCHANGE2),
  ]);

//   const [data1, data2] = await Promise.all([
//     page1.fetchData(PAGE_URL_1, GET_API_1, true),
//     page2.fetchData(PAGE_URL_2, GET_API_2),
//   ]);

  const [expiry1, expiry2] = [new ExpiryOne(data1).getExpiry(),new ExpiryTwo(data2).getExpiry()];
  // Close pages when done
  await Promise.allSettled([
    browserManager.closePage(EXCHANGE),
    browserManager.closePage(EXCHANGE2),
  ]);

  // Close browser
  await browserManager.closeBrowser();
};

main();

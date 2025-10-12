const { runCLI, getBrowser, insertAllData, handleExpiryCache, processFetchedData } = require('./header');
const { PAGE_URL_1, PAGE_URL_2,PAGE_ACTIVE_URL_1,PAGE_ACTIVE_URL_2,GET_API_1, GET_API_2,GET_API_ACTIVE_1,GET_API_ACTIVE_2,EXCHANGE,EXCHANGE2, GET_API_FUTURE_2,DYNAMO_DB_TABLE_1,DYNAMO_DB_TABLE_2} = require("./constants");

const { Browser } = require('./class/browser/browser');

const browserManager = new Browser();

async function main() {
  const page1 = await browserManager.createPage(EXCHANGE);
  const page2 = await browserManager.createPage(EXCHANGE2);

  const data1 = await page1.fetchData(PAGE_URL_1, GET_API_1, true);
  const data2 = await page2.fetchData(PAGE_URL_2, GET_API_2);


  // Close pages when done
  await browserManager.closePage(EXCHANGE);
  await browserManager.closePage(EXCHANGE2);

  // Close browser
  await browserManager.closeBrowser();
}

main();

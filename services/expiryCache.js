const { EXCHANGE, EXCHANGE2 } = require('../constants');
const { buildUrl, fetchData } = require('./utils/header');

/**
 * 🧱 Helper: Build expiry URLs from expiry date array
 */
function buildExpiryUrls(dateArray, exchange) {
  // ✅ Validate input: must be a non-empty array
  if (!Array.isArray(dateArray) || dateArray.length === 0) {
    return {};
  }

  const [expiry1, expiry2] = dateArray;

  return {
    GET_API_EXPIRY_1: buildUrl(expiry1, exchange),
    GET_API_EXPIRY_2: buildUrl(expiry2, exchange),
  };
}


/**
 * Returns local expiryData if available, otherwise null
 */
function getLocalExpiryData() {
  try {
    const { expiryDates } = require('../dat');
    return expiryDates?.length >= 2 ? expiryDates : null;
  } catch {
    return null; // file not present (Lambda)
  }
}

/**
 * Local-only function
 */
function getLocalExpiry() {
  const localExpiryData = getLocalExpiryData();
  if (!localExpiryData) {
    throw new Error('Local expiryData not available');
  }
  return localExpiryData;
}

/**
 * Lambda/fetch function
 */
async function getLambdaExpiry(browser, pageUrl, apiUrl, exchange) {
  let useCookies = exchange === EXCHANGE ? true : false
  const data = await fetchData(browser, pageUrl, apiUrl,useCookies);
  let dateArray;

  switch (exchange) {
    case EXCHANGE: {
      const { expiryDates } = data;
      dateArray = expiryDates;
      break;
    }

    case EXCHANGE2: {
      const { Table1 } = data;
      dateArray = Table1;
      break;
    }

    default:
      dateArray = [];
  }

  return dateArray;
}


/**
 * Controller: decide which one to call
 */
async function handleExpiryCache(browser, cache, pageUrl, apiUrl,exchange) {
  if (cache) {
    console.log('✅ Cache Hit');
    return cache;
  }

  console.log('❌ Cache Miss');

  const expiryDates = getLocalExpiryData()
    ? getLocalExpiry()
    : await getLambdaExpiry(browser, pageUrl, apiUrl,exchange);

  return buildExpiryUrls(expiryDates,exchange);
}

module.exports = { handleExpiryCache };

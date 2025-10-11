const { buildUrl, fetchData } = require('./utils/header');

/**
 * Returns local expiryData if available, otherwise null
 */
function getLocalExpiryData() {
  try {
    const { expiryDates } = require('../data');
    return 2 <= expiryDates ?.length ? expiryDates : null;
  } catch {
    return null; // file not present (Lambda)
  }
}


// 1️⃣ Local-only function
function getLocalExpiry() {
  const localExpiryData = getLocalExpiryData();
  if (!localExpiryData) {
    throw new Error('Local expiryData not available');
  }
  const [ExpiryDate, ExpiryDate2] = localExpiryData.expiryDates;
  return {
    GET_API_EXPIRY_1: buildUrl(ExpiryDate),
    GET_API_EXPIRY_2: buildUrl(ExpiryDate2),
  };
}

// 2️⃣ Lambda/fetch function
async function getLambdaExpiry(browser, pageUrl, apiUrl) {
  const { expiryDates: [ExpiryDate, ExpiryDate2] } = await fetchData(browser, pageUrl, apiUrl);
  return {
    GET_API_EXPIRY_1: buildUrl(ExpiryDate),
    GET_API_EXPIRY_2: buildUrl(ExpiryDate2),
  };
}

// 3️⃣ Controller: decide which one to call
async function handleExpiryCache(browser, cache, pageUrl, apiUrl) {
  if (cache) {
    console.log('✅ Cache Hit');
    return cache;
  }
  
  console.log('❌ Cache Miss');

  if (getLocalExpiryData()) {
    return getLocalExpiry();
  } else {
    return await getLambdaExpiry(browser, pageUrl, apiUrl);
  }
}

module.exports = { handleExpiryCache };

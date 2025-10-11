const { EXCHANGE } = require('../constants');
const { fetchData, getMiddleStrikes } = require('./utils/header');
const { FutureONE , OptionChainParent , MostActiveContractONE } = require('../class'); 
/**
 * Try to load local data (dev environment)
 */
function getLocalData() {
  try {
    const { currentData, nextData, activeData } = require('../data');
    if (!currentData || !nextData || !activeData) return null;
    return { currentData, nextData, activeData };
  } catch {
    return null; // Local data not present (Lambda)
  }
}

/**
 * Process local data
 */
function processLocalData(local) {
  const { currentData, nextData, activeData } = local;
  
  const [ 
    { records: { timestamp, underlyingValue ,data : current }} ,
    { records: { data: next }}, 
    { volume: { data: volData }, value: { data: valData } }, 
  ] = [ currentData, nextData, activeData ] ;

  const filterNext = getMiddleStrikes(next,underlyingValue);
  const filterCurrent = getMiddleStrikes(current,underlyingValue);
  
  const mostActiveData = volData.find(item => item.underlying === EXCHANGE);
  const future = valData.find(item => item.underlying === 'NIFTY' && item.instrumentType === 'FUTIDX');
  
  const items = {
    compressedFuture: new FutureONE(future,timestamp),
    compressedNext: new OptionChainParent(filterNext,timestamp),
    compressedCurrent: new OptionChainParent(filterCurrent,timestamp),
    compressedActive : new MostActiveContractONE(mostActiveData,timestamp)
  };

  // debugger
  return items;
}

/**
 * Fetch and process data from Lambda / production
*/
async function processRemoteData(browser, PAGE_URL_1, PAGE_URL_2, cachedExpiry, GET_API_2) {
  const { GET_API_EXPIRY_1, GET_API_EXPIRY_2 } = cachedExpiry;

  const [
    { records: { timestamp, data : current } },
    { records: { data: next } },
    { volume: { data: volData }, value: { data: valData } }
  ] = await Promise.all([
    fetchData(browser, PAGE_URL_1, GET_API_EXPIRY_1),
    fetchData(browser, PAGE_URL_1, GET_API_EXPIRY_2),
    fetchData(browser, PAGE_URL_2, GET_API_2),
  ]);
  
  const filterNext = getMiddleStrikes(next,underlyingValue);
  const filterCurrent = getMiddleStrikes(current,underlyingValue);
  
  const mostActiveData = volData.find(item => item.underlying === EXCHANGE);
  const future = valData.find(item => item.underlying === 'NIFTY' && item.instrumentType === 'FUTIDX');
  
  const items = {
    compressedFuture: new FutureONE(future,timestamp),
    compressedNext: new OptionChainParent(filterNext,timestamp),
    compressedCurrent: new OptionChainParent(filterCurrent,timestamp),
    compressedActive : new MostActiveContractONE(mostActiveData,timestamp)
  };

  return items;
}

/**
 * Controller: decides whether to use local or remote
 */
async function processFetchedData(browser, PAGE_URL_1, PAGE_URL_2, cachedExpiry, GET_API_2) {
  const local = getLocalData();
  if (local) {
    return processLocalData(local);
  } else {
    return await processRemoteData(browser, PAGE_URL_1, PAGE_URL_2, cachedExpiry, GET_API_2);
  }
}

module.exports = { processFetchedData }; 

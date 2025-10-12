const { EXCHANGE,EXCHANGE2 } = require('../constants');
const { fetchData, getMiddleStrikes } = require('./utils/header');
const { 
  FutureONE, FutureTWO, 
  OptionChainParent, OptionChainParentTWO, 
  MostActiveContractONE, MostActiveContractTWO 
} = require('../class'); 

const filepath = '../datas';

/**
 * Try to load local data (dev environment)
 */
function getLocalData() {
  try {
    const { currentData, nextData, activeData } = require(filepath);
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
    { records: { timestamp, underlyingValue, data: current }},
    { records: { data: next }},
    { volume: { data: volData }, value: { data: valData }},
  ] = [currentData, nextData, activeData];

  const filterNext = getMiddleStrikes(next, underlyingValue);
  const filterCurrent = getMiddleStrikes(current, underlyingValue);

  const mostActiveData = volData.find(item => item.underlying === EXCHANGE);
  const future = valData.find(item => item.underlying === EXCHANGE && item.instrumentType === 'FUTIDX');

  return {
    compressedFuture: new FutureONE(future, timestamp),
    compressedNext: new OptionChainParent(filterNext, timestamp),
    compressedCurrent: new OptionChainParent(filterCurrent, timestamp),
    compressedActive: new MostActiveContractONE(mostActiveData, timestamp)
  };
}

/**
 * Process remote data for EXCHANGE
 */
async function processRemoteOne(browser, page1, page2, cachedExpiry, GET_API_ACTIVE) {
  const useCookies = true;
  const { GET_API_EXPIRY_1, GET_API_EXPIRY_2 } = cachedExpiry;

  const [option1, option2, active] = await Promise.all([
    fetchData(browser, page1, GET_API_EXPIRY_1, useCookies),
    fetchData(browser, page1, GET_API_EXPIRY_2, useCookies),
    fetchData(browser, page2, GET_API_ACTIVE, useCookies)
  ]);
  
  const { records: { timestamp, underlyingValue, data: current } } = option1;
  const { records: { data: next } } = option2;
  const { volume: { data: volData }, value: { data: valData } } = active;
  
  const filterNext = getMiddleStrikes(next, underlyingValue,EXCHANGE);
  const filterCurrent = getMiddleStrikes(current, underlyingValue,EXCHANGE);
  
  const mostActiveData = volData.find(item => item.underlying === EXCHANGE);
  const future = valData.find(item => item.underlying === EXCHANGE && item.instrumentType === 'FUTIDX');
  
  const items = {
    compressedFuture: new FutureONE(future, timestamp),
    compressedNext: new OptionChainParent(filterNext, timestamp),
    compressedCurrent: new OptionChainParent(filterCurrent, timestamp),
    compressedActive: new MostActiveContractONE(mostActiveData, timestamp)
  };

  return items;
}

/**
 * Process remote data for EXCHANGE2
*/
async function processRemoteTwo(browser, page1, page2, cachedExpiry, GET_API_ACTIVE,GET_API_FUTURE_2) {
  const useCookies = false;
  const { GET_API_EXPIRY_1, GET_API_EXPIRY_2 } = cachedExpiry;

  const [option1, option2, active, futureArr] = await Promise.all([
    fetchData(browser, page1, GET_API_EXPIRY_1, useCookies),
    fetchData(browser, page1, GET_API_EXPIRY_2, useCookies),
    fetchData(browser, page2, GET_API_ACTIVE, useCookies),
    fetchData(browser, page2, GET_API_FUTURE_2, useCookies)
  ]);
  
  let { Table: next } = option2;
  let { Table: current, ASON: { DT_TM: timestamp } } = option1;
  const [ volData ] = active, [ future ] = futureArr

  timestamp = `${timestamp.replace("|", "").trim()}`;
  const underlyingValue = future?.LTP; // or assign if available

  const filterNext = getMiddleStrikes(next, underlyingValue,EXCHANGE2);
  const filterCurrent = getMiddleStrikes(current, underlyingValue,EXCHANGE2);

  const mostActiveData = volData;

  const items = {
    compressedFuture: new FutureTWO(future, timestamp),
    compressedNext: new OptionChainParentTWO(filterNext, timestamp),
    compressedCurrent: new OptionChainParentTWO(filterCurrent, timestamp),
    compressedActive: new MostActiveContractTWO(mostActiveData, timestamp)
  };

  // debugger
  return items;
}

/**
 * Controller: decides whether to use local or remote
 */
async function processFetchedData(browser, page1, PAGE_URL_2, cachedExpiry, GET_API_2, exchange, GET_API_FUTURE_2) {
  const local = getLocalData();
  if (local) {
    return processLocalData(local);
  }

  if (exchange === EXCHANGE) {
    return await processRemoteOne(browser, page1, PAGE_URL_2, cachedExpiry, GET_API_2);
  } else {
    return await processRemoteTwo(browser, page1, PAGE_URL_2, cachedExpiry, GET_API_2, GET_API_FUTURE_2);
  }
}

module.exports = { processFetchedData };

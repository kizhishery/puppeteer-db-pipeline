const { runCLI } = require('./puppeteer/runCLI');
const { getBrowser } = require('./puppeteer/browser');
const { insertAllData } = require('./services/inserter');
const { handleExpiryCache } = require('./services/expiryCache');
const { processFetchedData } = require('./services/dataProcessor');
const { CacheManager } = require('./class')

module.exports = { runCLI, getBrowser, insertAllData, handleExpiryCache, processFetchedData , CacheManager}


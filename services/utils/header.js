const { fetchData } = require('../../puppeteer/fetchData');
const { buildUrl, getMiddleStrikes } = require('../../utils');
const { insertStrikeData, insertMostActive, insertFutureData } = require('../../dynamodb');

module.exports = {fetchData,buildUrl,insertStrikeData,insertMostActive,insertFutureData,getMiddleStrikes};
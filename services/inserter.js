const { insertStrikeData, insertMostActive, insertFutureData } = require('./utils/header');

async function insertAllData({ compressedFuture,compressedNext,compressedCurrent,compressedActive }) {
  await Promise.all([
    insertStrikeData(compressedNext),
    insertStrikeData(compressedCurrent),

    insertFutureData(compressedFuture),
    insertMostActive(compressedActive),
  ]);
}

module.exports = { insertAllData };

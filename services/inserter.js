const { insertStrikeData, insertMostActive, insertFutureData } = require('./utils/header');

async function insertAllData({ compressedFuture,compressedNext,compressedCurrent,compressedActive }, TABLE) {
  // debugger
  await Promise.all([
    insertStrikeData(compressedNext,TABLE),
    insertStrikeData(compressedCurrent,TABLE),

    insertFutureData(compressedFuture,TABLE),
    insertMostActive(compressedActive,TABLE),
  ]);
}

module.exports = { insertAllData };

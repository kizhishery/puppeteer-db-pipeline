const { INSERT } = require('../constants');
const { insertItem } = require("./utils/header");

const insertStrikeData = async (data) => {
  try {
    if (!data) {
      console.error("❌ Required field missing or malformed in input for strike data");
      return;
    }
    
    const startTime = Date.now()

    for (const option of data.getData()) {
      const item = option;
      await insertItem(item);
    }
    
    const elapsed = Date.now() - startTime; // calculate elapsed time
    
    if(INSERT) {
      console.log(`✅ Inserted future parallel (${elapsed} ms)`);
      return;
    }

    console.log(`🏭 Disabled insert for testing purpose | INSERT=''`);
    
  } catch (err) {
    console.error("❌ Error processing strike data:", err);
  }
};

module.exports = insertStrikeData;
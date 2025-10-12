const { INSERT } = require("../constants");
const { insertItem } = require("./utils/header");

const insertStrikeData = async (data, TABLE) => {
  try {
    if (!data) {
      console.error(
        "❌ Required field missing or malformed in input for strike data"
      );
      return;
    }
    if (!INSERT) {
      console.log(`🏭 Disabled insert for testing purpose | INSERT=''`);
      return;
    }

    const startTime = Date.now();

    for (const option of data.getData()) {
      // debugger
      const item = option;
      await insertItem(item, TABLE);
    }

    const elapsed = Date.now() - startTime; // calculate elapsed time
    console.log(`✅ Inserted future parallel (${elapsed} ms)`);
  } catch (err) {
    console.error("❌ Error processing strike data:", err);
  }
};

module.exports = insertStrikeData;

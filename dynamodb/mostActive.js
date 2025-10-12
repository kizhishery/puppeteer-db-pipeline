const { INSERT } = require("../constants");
const { insertItem } = require("./utils/header");

const insertMostActive = async (data, TABLE) => {
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

    const item = data.getData();
    await insertItem(item, TABLE);

    const elapsed = Date.now() - startTime; // calculate elapsed time

    console.log(`✅ Inserted future parallel (${elapsed} ms)`);
  } catch (err) {
    console.error("❌ Error processing most active data:", err);
  }
};

module.exports = insertMostActive;

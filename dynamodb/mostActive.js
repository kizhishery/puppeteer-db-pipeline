const { INSERT } = require('../constants');
const { insertItem } = require("./utils/header");

const insertMostActive = async (data) => {
  try {
    if (!data) {
      console.error("❌ Required field missing or malformed in input for strike data");
      return;
    }

    const startTime = Date.now()

    const item = data.getData();
    await insertItem(item);
    
    const elapsed = Date.now() - startTime; // calculate elapsed time

    if(INSERT) {
      console.log(`✅ Inserted future parallel (${elapsed} ms)`);
      return;
    }

    console.log(`🏭 Disabled insert for testing purpose | INSERT=''`);

  } catch (err) {
    console.error("❌ Error processing most active data:", err);
  }
};

module.exports = insertMostActive;
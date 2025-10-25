let { INSERT } = require("../../constants");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

class DynamoInserter {
  constructor(payload) {
    this.payload = payload;

    // Single DynamoDB client
    this.client = new DynamoDBClient({ region: process.env.AWS_REGION });
  }

  // Insert a single item
  async #insertItem(item) {
    const { table, ...rest } = item;

    try {
      await this.client.send(
        new PutItemCommand({
          TableName: table,
          Item: marshall(rest),
        })
      );
    } catch (err) {
      // Handle errors silently or log if needed
      console.log(err);
    }
  }

async insert() {
  
  // debugger
  // debugger;
  // Skip if INSERT is false or payload is empty
  if (!INSERT || Object.keys(this.payload).length === 0) {
    // debugger
    console.log("🏭 Skipped insertion | INSERT = false");
    return;
  }

  // Proceed with valid payload
  await this.#insertItem(this.payload);
}

  
  // Insert all items concurrently with limited concurrency
  async insertAll(concurrency = 20) {
    // debugger
    // debugger;
    if (!this.payload.length || !INSERT) {
      // debugger;
      console.log("🏭 skipped insertion | INSERT = false");
      return;
    }

    let index = 0;

    const worker = async () => {
      while (index < this.payload.length) {
        const currentIndex = index++;
        await this.#insertItem(this.payload[currentIndex]);
      }
    };

    const workers = Array.from(
      { length: Math.min(concurrency, this.payload.length) },
      () => worker()
    );

    await Promise.all(workers);
    // console.log('✅ Inserted All Data')
  }
}

module.exports = { DynamoInserter };

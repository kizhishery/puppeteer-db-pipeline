const { marshall } = require("@aws-sdk/util-dynamodb");
const { DYNAMO_DB_TABLE, INSERT, MAX_CONNECTIONS } = require("../../constants");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

/**
 * ⚡ Maintain a small pool of reusable DynamoDB clients
 * for concurrent writes, re-used across Lambda warm starts.
 */
const clientPool = [];
let connectionIndex = 0;

function getDynamoClient() {
  // Create up to MAX_CONNECTIONS clients
  if (clientPool.length < MAX_CONNECTIONS) {
    const newClient = new DynamoDBClient({ region: process.env.AWS_REGION });
    clientPool.push(newClient);
    console.log(`⚡ Created DynamoDB client #${clientPool.length}`);
  }

  // Rotate between existing connections
  const client = clientPool[connectionIndex];
  connectionIndex = (connectionIndex + 1) % clientPool.length;
  return client;
}

async function insertItem(item) {
  if (!INSERT) {
    return;
  }

  const client = getDynamoClient();

  try {
    
    await client.send(
      new PutItemCommand({
        TableName: DYNAMO_DB_TABLE,
        Item: marshall(item),
      })
    );

  } catch (err) {
    console.error("❌ DynamoDB insert error:", err);
  }
}

module.exports = { insertItem };

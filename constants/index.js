// Load .env only when not running inside Lambda/production
if (!process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.LAMBDA_TASK_ROOT) {
  require("dotenv").config();
}

// base url
const { BASE_URL,PAGE_URL_1,PAGE_URL_2,GET_API_1,GET_API_2,DYNAMO_DB_TABLE,EXCHANGE,INSERT,TTL,MAX_CONNECTIONS} = process.env;

module.exports = {BASE_URL,PAGE_URL_1,PAGE_URL_2,GET_API_1,GET_API_2,DYNAMO_DB_TABLE,EXCHANGE,TTL,INSERT,MAX_CONNECTIONS};

// Load .env only when not running inside Lambda/production
if (!process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.LAMBDA_TASK_ROOT) {
  require("dotenv").config();
}

// loop process locally
const ITERATION = 3;
// db
const TTL=0.1, INSERT=false;

// base url
const {
  GET_API_FUTURE_2,
  EXCHANGE,EXCHANGE2,
  GET_API_1,GET_API_2,
  BASE_URL,BASE_URL_2,
  PAGE_URL_1,PAGE_URL_2,
  GET_API_ACTIVE_1,GET_API_ACTIVE_2,
  DYNAMO_DB_TABLE_1,DYNAMO_DB_TABLE_2,
  PAGE_ACTIVE_URL_1,PAGE_ACTIVE_URL_2,
} = process.env;

module.exports = {
  ITERATION,
  GET_API_FUTURE_2,
  EXCHANGE,EXCHANGE2,
  BASE_URL,BASE_URL_2,
  GET_API_1,GET_API_2,
  PAGE_URL_1,PAGE_URL_2,
  TTL,INSERT,
  GET_API_ACTIVE_1,GET_API_ACTIVE_2,
  DYNAMO_DB_TABLE_1,DYNAMO_DB_TABLE_2,
  PAGE_ACTIVE_URL_1,PAGE_ACTIVE_URL_2
};

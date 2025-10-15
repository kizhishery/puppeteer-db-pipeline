// index.js
const { runLambda } = require('./utils/lambda');
// Lambda handler
exports.handler = runLambda;


const { runLocal } = require('./utils/local');
// Run locally if executed directly
if (require.main === module) {
  runLocal().catch(console.error);
}


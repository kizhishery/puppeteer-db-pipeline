// index.js
const { runLocal ,runLambda } = require('./utils');
// Lambda handler
exports.handler = runLambda;

debugger

// Run locally if executed directly
if (require.main === module) {
  runLocal().catch(console.error);
}


const fs = require('fs');
const path = require('path');
const data = require('./new.json');

// Convert JSON to compact string
const json = JSON.stringify(data); // no spacing, smallest size

// Build the full file path
const filePath = path.join(__dirname, 'newf.json');

// Write to file
fs.writeFileSync(filePath, json, 'utf8');

console.log('data2.json created successfully!');

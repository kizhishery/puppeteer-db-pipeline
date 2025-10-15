const { page1, page2 } = require('./index');

const fs = require('fs');
const path = require('path');

// let filepath = path.join(__dirname,'obj1.json');
// let filepath2 = path.join(__dirname,'obj2.json');

// fs.writeFile(filepath,JSON.stringify(data,null,2));
// fs.writeFile(filepath2,JSON.stringify(data2,null,2));

const filepath1 = path.join(__dirname, 'page1.json');
const filepath2 = path.join(__dirname, 'page2.json');

fs.writeFileSync(filepath1, JSON.stringify(page1, null, 2));
fs.writeFileSync(filepath2, JSON.stringify(page2, null, 2));

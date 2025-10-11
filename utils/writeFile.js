const fs = require('fs');

const writeFile = async (file) => {
    const tasks = file.map(([path, dat]) => {
        fs.writeFileSync(path,JSON.stringify(dat,null,2))
    })

    await Promise.all(tasks);
}

module.exports = { writeFile }
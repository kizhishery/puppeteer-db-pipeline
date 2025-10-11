const { BASE_URL } = require("../constants");

const buildUrl = (date) => {
    return `${BASE_URL}${encodeURIComponent(date)}`;
}


module.exports = { buildUrl };
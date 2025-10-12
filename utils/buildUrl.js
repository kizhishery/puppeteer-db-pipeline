const { BASE_URL,BASE_URL_2,EXCHANGE} = require("../constants");

const buildUrl = (date,exchange) => {
    let url;
    if(exchange == EXCHANGE)
        url = `${BASE_URL}${encodeURIComponent(date)}`;
    else 
        url = `${BASE_URL_2}?Expiry=${encodeURIComponent(date.ExpiryDate)}&scrip_cd=1&strprice=0`;
    // debugger
    return url;
}

module.exports = { buildUrl };
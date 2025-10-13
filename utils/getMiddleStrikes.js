const { EXCHANGE } = require('../constants');

function getMiddleStrikes(arr, underlyingValue,exchange) {
    let strikeCount = 10, delta = exchange == EXCHANGE ? 50 : 100;
    // Round underlying to nearest delta
    const roundedUnderlying = Math.round(underlyingValue / delta) * delta;

    // Define lower and upper bound (10 strikes each side)
    const lowestStrike = roundedUnderlying - (strikeCount * delta);
    const highestStrike = roundedUnderlying + (strikeCount * delta);

    // Filter only strikes within bounds
    let filter = [];
    if(exchange == EXCHANGE) {
        filter = arr.filter(option =>
            option.strikePrice >= lowestStrike &&
            option.strikePrice <= highestStrike
        );
    }
    else {
        filter = arr.filter(option =>
            Number(option.Strike_Price1) >= lowestStrike &&
            Number(option.Strike_Price1) <= highestStrike
        );
    }
    
    return filter;
}

module.exports = { getMiddleStrikes };






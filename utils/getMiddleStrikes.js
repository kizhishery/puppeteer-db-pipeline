function getMiddleStrikes(arr, underlyingValue) {
    let strikeCount = 10, delta = 50;
    // Round underlying to nearest delta
    const roundedUnderlying = Math.round(underlyingValue / delta) * delta;

    // Define lower and upper bound (10 strikes each side)
    const lowestStrike = roundedUnderlying - (strikeCount * delta);
    const highestStrike = roundedUnderlying + (strikeCount * delta);

    // Filter only strikes within bounds
    return arr.filter(option =>
        option.strikePrice >= lowestStrike &&
        option.strikePrice <= highestStrike
    );
}

module.exports = { getMiddleStrikes };

function getMedian(args) {
    if (!args.length) {
        return 0;
    }
    const numbers = args.slice(0).sort((a, b) => a - b);
    const middle = Math.floor(numbers.length / 2);
    const isEven = numbers.length % 2 === 0;
    return isEven
        ? (numbers[middle] + numbers[middle - 1]) / 2
        : numbers[middle];
}

function getAverage(args) {
    if (!args.length) {
        return 0;
    }
    const total = args.reduce((total, value) => total + value, 0);
    return total / args.length;
}

function getMin(args) {
    if (!args.length) {
        return 0;
    }
    const numbers = args.slice(0).sort((a, b) => a - b);
    return numbers[0];
}

function getMax(args) {
    if (!args.length) {
        return 0;
    }
    const numbers = args.slice(0).sort((a, b) => b - a);
    return numbers[0];
}

function getStandardDeviation(args, avg) {
    if (!args.length) {
        return 0;
    }
    const total = args.reduce(
        (total, value) => (value - avg) * (value - avg),
        0
    );
    return Math.sqrt(total / args.length);
}

function range(count) {
    return Array.from(new Array(count).keys());
}

module.exports = {
    getMedian: getMedian,
    getAverage: getAverage,
    getStandardDeviation: getStandardDeviation,
    getMin: getMin,
    getMax: getMax,
    range: range,
};

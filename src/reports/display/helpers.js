const moment = require('moment');
const pad = require('pad');

const Alignment = {
    Left: 'Left',
    Right: 'Right',
};

function toString(v) {
    return v.toString();
}

function toHours(v) {
    return moment.duration(v).asHours().toFixed(2);
}

function alignText(text, column) {
    return column.align === Alignment.Right ?
        pad(column.size, text) :
        pad(text, column.size);
}

function format(value, column) {
    const text = column.map ? column.map(value) : value;
    return alignText(text, column);
}

function generateTableHeaders(columns) {
    return columns.map(column => alignText(column.label, column)).join(' | ');
}

function generateTableLines(data, columns) {
    return data
        .map(line => columns
            .map(column => format(line[column.name], column))
            .join(' | ')
        )
        .join('\r\n');
}

module.exports = {
    Alignment: Alignment,
    alignText: alignText,
    format: format,
    generateTableHeaders: generateTableHeaders,
    generateTableLines: generateTableLines,
    toHours: toHours,
    toString: toString,
};

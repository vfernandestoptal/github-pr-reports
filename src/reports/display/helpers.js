const moment = require('moment');
const pad = require('pad');

const REPORT_CHARS_WIDTH = 120;

const Alignment = {
    Left: 'Left',
    Right: 'Right',
};

function toString(v) {
    return v.toString();
}

function toDecimals(places) {
    return v => v.toFixed(places);
}

function toHours(v) {
    return moment
        .duration(v)
        .asHours()
        .toFixed(2);
}

function alignText(text, column) {
    return column.align === Alignment.Right
        ? pad(column.size, text)
        : pad(text, column.size);
}

function format(value, column) {
    const text = column.map ? column.map(value) : value;
    return alignText(text, column);
}

function generateTableHeaders(columns) {
    return columns.map(column => alignText(column.label, column)).join(' | ');
}

function generateTableLine(line, columns) {
    return columns.map(column => format(line[column.name], column)).join(' | ');
}

function generateTableLines(data, columns) {
    return data.map(line => generateTableLine(line, columns)).join('\r\n');
}

function generateReportDivider() {
    return '='.repeat(REPORT_CHARS_WIDTH);
}

function generateSectionDivider() {
    return '-'.repeat(REPORT_CHARS_WIDTH);
}

module.exports = {
    Alignment: Alignment,
    alignText: alignText,
    format: format,
    generateTableHeaders: generateTableHeaders,
    generateTableLine: generateTableLine,
    generateTableLines: generateTableLines,
    generateReportDivider: generateReportDivider,
    generateSectionDivider: generateSectionDivider,
    toDecimals: toDecimals,
    toHours: toHours,
    toString: toString,
};

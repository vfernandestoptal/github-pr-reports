'use strict';

const moment = require('moment');
const Alignment = require('./helpers').Alignment;
const helpers = require('./helpers');

const userColumns = [
    { label: 'User', name: 'name', size: 28 },
    { label: '[00 - 08[', name: 'buckets', size: 10, map: (value) => value[0] && value[0].count.toString() || '-', align: Alignment.Right },
    { label: '[08 - 16[', name: 'buckets', size: 10, map: (value) => value[1] && value[1].count.toString() || '-', align: Alignment.Right },
    { label: '[16 - 24[', name: 'buckets', size: 10, map: (value) => value[2] && value[2].count.toString() || '-', align: Alignment.Right },
    { label: '[24 - 32[', name: 'buckets', size: 10, map: (value) => value[3] && value[3].count.toString() || '-', align: Alignment.Right },
    { label: '[32 - 40[', name: 'buckets', size: 10, map: (value) => value[4] && value[4].count.toString() || '-', align: Alignment.Right },
    { label: '[40 - 48[', name: 'buckets', size: 10, map: (value) => value[5] && value[5].count.toString() || '-', align: Alignment.Right },
    { label: '48+', name: 'buckets', size: 10, map: (value) => value[6] && value[6].count.toString() || '-', align: Alignment.Right },
];

function generate(data) {
    return `
${helpers.generateReportDivider()}

Report: Users Time to Review Intervals
${helpers.generateSectionDivider()}

Project: ${data.organization}/${data.repository}
Date Period: ${moment(data.startDate).format('LL')} to ${moment(data.endDate).format('LL')}

${helpers.generateSectionDivider()}
${helpers.generateTableHeaders(userColumns)}
${helpers.generateSectionDivider()}
${helpers.generateTableLines(data.users, userColumns)}
${helpers.generateSectionDivider()}
${helpers.generateTableLine(data.totals, userColumns)}
${helpers.generateReportDivider()}
    `;
}

module.exports = {
    generate: generate,
};

'use strict';

const moment = require('moment');
const Alignment = require('./helpers').Alignment;
const helpers = require('./helpers');

const userColumns = [
    { label: 'User', name: 'name', size: 28 },
    {
        label: 'Open',
        name: 'openCount',
        size: 8,
        map: helpers.toString,
        align: Alignment.Right,
    },
    {
        label: 'Merged',
        name: 'mergedCount',
        size: 8,
        map: helpers.toString,
        align: Alignment.Right,
    },
    {
        label: 'Avg Reviews',
        name: 'averageReviewCount',
        size: 15,
        map: helpers.toDecimals(2),
        align: Alignment.Right,
    },
    {
        label: 'Median Reviews',
        name: 'medianReviewCount',
        size: 15,
        map: helpers.toDecimals(2),
        align: Alignment.Right,
    },
];

function generate(data) {
    return `
${helpers.generateReportDivider()}

Report: Users Pull Request Counts
${helpers.generateSectionDivider()}

Project: ${data.organization}/${data.repository}
Date Period: ${moment(data.startDate).format('LL')} to ${moment(
        data.endDate
    ).format('LL')}
Generated On: ${moment(data.generatedOn).format('LLL')}

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

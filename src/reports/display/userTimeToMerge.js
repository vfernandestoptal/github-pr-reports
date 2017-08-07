'use strict';

const moment = require('moment');
const Alignment = require('./helpers').Alignment;
const helpers = require('./helpers');

const userColumns = [
    { label: 'User', name: 'name', size: 28 },
    { label: 'Open', name: 'openCount', size: 8, map: helpers.toString, align: Alignment.Right },
    { label: 'Merged', name: 'mergedCount', size: 8, map: helpers.toString, align: Alignment.Right },
    { label: 'Min', name: 'minMergeTime', size: 8, map: helpers.toHours, align: Alignment.Right },
    { label: 'Avg', name: 'averageMergeTime', size: 8, map: helpers.toHours, align: Alignment.Right },
    { label: 'Median', name: 'medianMergeTime', size: 8, map: helpers.toHours, align: Alignment.Right },
    { label: 'Max', name: 'maxMergeTime', size: 8, map: helpers.toHours, align: Alignment.Right },
    { label: 'Avg R.', name: 'averageReviewCount', size: 10, map: helpers.toDecimals(2), align: Alignment.Right },
    { label: 'Median R.', name: 'medianReviewCount', size: 10, map: helpers.toDecimals(2), align: Alignment.Right },
];

function generate(data) {
    return `
${helpers.generateReportDivider()}

Report: Users Time to Merge
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

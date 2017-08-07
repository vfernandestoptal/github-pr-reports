'use strict';

const moment = require('moment');
const Alignment = require('./helpers').Alignment;
const helpers = require('./helpers');

const userColumns = [
    { label: 'User', name: 'name', size: 28 },
    { label: 'Count', name: 'reviewCount', size: 8, map: helpers.toString, align: Alignment.Right },
    { label: 'Median', name: 'medianReviewTime', size: 8, map: helpers.toHours, align: Alignment.Right },
    { label: '-σ', name: 'minDeviationReviewTime', size: 8, map: helpers.toHours, align: Alignment.Right },
    { label: 'Avg', name: 'averageReviewTime', size: 8, map: helpers.toHours, align: Alignment.Right },
    { label: '+σ', name: 'maxDeviationReviewTime', size: 8, map: helpers.toHours, align: Alignment.Right },
    { label: 'Std Dev', name: 'standardDeviationReviewTime', size: 8, map: helpers.toHours, align: Alignment.Right },
];

function generate(data) {
    return `
${helpers.generateReportDivider()}

Report: Users Time to Review
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

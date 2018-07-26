'use strict';

const moment = require('moment');
const Alignment = require('./helpers').Alignment;
const helpers = require('./helpers');

function generate(data) {
    const userColumns = [
        { label: 'User', name: 'name', size: 28 },
        {
            label: 'Count',
            name: 'reviewCount',
            size: 8,
            map: helpers.toString,
            align: Alignment.Right,
        },
    ];

    if (data.users.length && data.users[0].buckets) {
        data.users[0].buckets.forEach((bucket, index) => {
            userColumns.push({
                label:
                    (bucket.maxValue &&
                        `${bucket.minValue} to ${bucket.maxValue}`) ||
                    `${bucket.minValue}+`,
                name: 'buckets',
                size: 8,
                map: value =>
                    (value[index] && value[index].count.toString()) || '-',
                align: Alignment.Right,
            });
        });
    }

    return `
${helpers.generateReportDivider()}

Report: Users Time to Review Intervals
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

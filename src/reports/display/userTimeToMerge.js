'use strict';

const moment = require('moment');
const Alignment = require('./helpers').Alignment;
const helpers = require('./helpers');

const userColumns = [
    { label: 'User', name: 'user', size: 26 },
    { label: 'Open', name: 'openCount', size: 6, map: helpers.toString, align: Alignment.Right },
    { label: 'Merged', name: 'mergedCount', size: 6, map: helpers.toString, align: Alignment.Right },
    { label: 'Min', name: 'minMergeTime', size: 6, map: helpers.toHours, align: Alignment.Right },
    { label: 'Avg', name: 'averageMergeTime', size: 6, map: helpers.toHours, align: Alignment.Right },
    { label: 'Median', name: 'medianMergeTime', size: 6, map: helpers.toHours, align: Alignment.Right },
    { label: 'Max', name: 'maxMergeTime', size: 6, map: helpers.toHours, align: Alignment.Right },
];

function generate(data) {
    return `
================================================================================

Report: Users Time to Merge
--------------------------------------------------------------------------------

Project: ${data.organization}/${data.repository}
Date Period: ${moment(data.startDate).format('LL')} to ${moment(data.endDate).format('LL')}

--------------------------------------------------------------------------------
${helpers.generateTableHeaders(userColumns)}
--------------------------------------------------------------------------------
${helpers.generateTableLines(data.users, userColumns)}
================================================================================
    `;
}

module.exports = {
    generate: generate,
};

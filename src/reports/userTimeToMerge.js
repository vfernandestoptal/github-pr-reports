'use strict';

const moment = require('moment');
const pad = require('pad');
const enums = require('../githubEnums');

function getNewUser(username) {
    return {
        user: username,
        openCount: 0,
        mergedCount: 0,
        mergeTimes: [],
    };
}

function groupByUser(data) {
    const users = data.pullRequests.reduce((users, pr) => {
        const user = users[pr.author] || getNewUser(pr.author);

        if (pr.state === enums.PullRequestState.OPEN) {
            user.openCount = user.openCount + 1;
        }
        else if (pr.state === enums.PullRequestState.MERGED) {
            user.mergedCount = user.mergedCount + 1;
            const mergeTime = moment.utc(pr.mergedAt).diff(moment.utc(pr.createdAt));
            user.mergeTimes.push(mergeTime);
        }

        users[pr.author] = user;
        return users;
    }, {});

    return Object.keys(users)
        .map(user => users[user]);
}

function generate(data) {
    const stats = groupByUser(data);

    const userLines = stats
        .map(user => `${pad(user.user, 30)} | ${pad(user.openCount.toString(), 10)} | ${pad(user.mergedCount.toString(), 10)}`)
        .join('\r\n');

    return `
================================================================================

Report: Users Time to Merge
--------------------------------------------------------------------------------

Project: ${data.organization}/${data.repository}
Date Period: ${moment(data.startDate).format('LL')} to ${moment(data.endDate).format('LL')}

${pad('User', 30)} | ${pad('Open', 10)} | ${pad('Merged', 10)}
--------------------------------------------------------------------------------
${userLines}
================================================================================
    `;
}

module.exports = {
    generate: generate,
};

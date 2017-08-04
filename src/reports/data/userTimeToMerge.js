'use strict';

const moment = require('moment');
const enums = require('../../githubEnums');
const helpers = require('./helpers');

function getNewUser(username) {
    return {
        user: username,
        pullRequests: [],
    };
}

function groupPullRequestsByAuthor(pullRequests) {
    return pullRequests.reduce((users, pr) => {
        const user = users[pr.author] || getNewUser(pr.author);
        user.pullRequests.push(pr);
        users[pr.author] = user;
        return users;
    }, {});
}

function generate(data) {
    const pullRequestsByAuthor = groupPullRequestsByAuthor(data.pullRequests);

    const users = Object.keys(pullRequestsByAuthor)
        .sort((a, b) => a.toLowerCase() < b.toLocaleLowerCase() ? -1 : 1)
        .map(user => {
            const pullRequests = pullRequestsByAuthor[user].pullRequests;
            const mergedTimes = pullRequests
                .filter(pr => pr.state === enums.PullRequestState.MERGED)
                .map(pr => moment.utc(pr.mergedAt).diff(moment.utc(pr.createdAt)));

            return {
                user: user,
                openCount: pullRequests.filter(pr => pr.state === enums.PullRequestState.OPEN).length,
                mergedCount: mergedTimes.length,
                averageMergeTime: helpers.getAverage(mergedTimes),
                medianMergeTime: helpers.getMedian(mergedTimes),
                minMergeTime: helpers.getMin(mergedTimes),
                maxMergeTime: helpers.getMax(mergedTimes),
            };
        });

    return {
        organization: data.organization,
        repository: data.repository,
        startDate: data.startDate,
        endDate: data.endDate,
        users: users,
    };
}

module.exports = {
    generate: generate,
};

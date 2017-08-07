'use strict';

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

function calculateStatistics(name, pullRequests) {
    const mergedPullRequests = pullRequests
        .filter(pr => pr.state === enums.PullRequestState.MERGED);

    const reviewsCount = mergedPullRequests
        .map(pr => pr.totalReviews);

    return {
        name: name,
        openCount: pullRequests.filter(pr => pr.state === enums.PullRequestState.OPEN).length,
        mergedCount: mergedPullRequests.length,
        averageReviewCount: helpers.getAverage(reviewsCount),
        medianReviewCount: helpers.getMedian(reviewsCount),
    };
}

function generate(data) {
    const pullRequestsByAuthor = groupPullRequestsByAuthor(data.pullRequests);

    const users = Object.keys(pullRequestsByAuthor)
        .sort((a, b) => a.toLowerCase() < b.toLocaleLowerCase() ? -1 : 1)
        .map(user => {
            const pullRequests = pullRequestsByAuthor[user].pullRequests;
            return calculateStatistics(user, pullRequests);
        });

    const totals = calculateStatistics('TOTALS', data.pullRequests);

    return {
        organization: data.organization,
        repository: data.repository,
        startDate: data.startDate,
        endDate: data.endDate,
        users: users,
        totals: totals,
    };
}

module.exports = {
    generate: generate,
};

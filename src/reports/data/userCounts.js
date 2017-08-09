'use strict';

const async = require('async');
const bluebird = require('bluebird');
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

function generate(data, options) {
    const dataDefered = bluebird.defer();
    const pullRequestsByAuthor = groupPullRequestsByAuthor(data.pullRequests);

    async.map(
        Object.keys(pullRequestsByAuthor).sort((a, b) => a.toLowerCase() < b.toLocaleLowerCase() ? -1 : 1),
        (user, callback) => {
            const pullRequests = pullRequestsByAuthor[user].pullRequests;
            async.setImmediate(() => callback(null, calculateStatistics(user, pullRequests)));
        },
        (err, users) => {
            if (err) {
                return dataDefered.reject(new Error('Error generating report data'));
            }

            const totals = calculateStatistics('TOTALS', data.pullRequests);
            dataDefered.resolve({
                organization: data.organization,
                repository: data.repository,
                startDate: data.startDate,
                endDate: data.endDate,
                generatedOn: data.generatedOn,
                users: users,
                totals: totals,
            });
        }
    );
    return dataDefered.promise;
}

module.exports = {
    generate: generate,
};

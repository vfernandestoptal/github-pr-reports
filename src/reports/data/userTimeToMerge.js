'use strict';

const async = require('async');
const bluebird = require('bluebird');
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

function calculateStatistics(name, pullRequests) {
    const mergedPullRequests = pullRequests
        .filter(pr => pr.state === enums.PullRequestState.MERGED);

    const mergedTimes = mergedPullRequests
        .map(pr => moment.utc(pr.mergedAt).diff(moment.utc(pr.createdAt)));

    const avgMergeTime = helpers.getAverage(mergedTimes);
    const stdevMergeTime = helpers.getStandardDeviation(mergedTimes, avgMergeTime);

    return {
        name: name,
        mergedCount: mergedPullRequests.length,
        averageMergeTime: avgMergeTime,
        medianMergeTime: helpers.getMedian(mergedTimes),
        minMergeTime: helpers.getMin(mergedTimes),
        maxMergeTime: helpers.getMax(mergedTimes),
        standardDeviationMergeTime: stdevMergeTime,
        minDeviationMergeTime: avgMergeTime - stdevMergeTime,
        maxDeviationMergeTime: avgMergeTime + stdevMergeTime,
    };
}

function generate(data) {
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
                generatedOn: moment.utc(),
                users: users.filter(user => user.mergedCount > 0),
                totals: totals,
            });
        }
    );
    return dataDefered.promise;
}

module.exports = {
    generate: generate,
};

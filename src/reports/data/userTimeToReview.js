'use strict';

const async = require('async');
const bluebird = require('bluebird');
const moment = require('moment');
const helpers = require('./helpers');

function getNewUser(username) {
    return {
        user: username,
        reviews: [],
    };
}

function groupReviewsByAuthor(pullRequests) {
    return pullRequests
        .reduce((users, pr) => {
            pr.reviews.forEach(review => {
                const user = users[review.user] || getNewUser(review.user);
                user.reviews.push({
                    url: pr.url,
                    assignedAt: review.assignedAt,
                    submittedAt: review.submittedAt,
                    reviewHours: moment.duration(moment.utc(review.submittedAt).diff(moment.utc(review.assignedAt))).asHours(),
                });
                users[review.user] = user;
            });

            return users;
        }, {});
}

function calculateStatistics(name, reviews) {
    const reviewTimes = reviews
        .filter(review => review.assignedAt && review.submittedAt)
        .map(review => moment.utc(review.submittedAt).diff(moment.utc(review.assignedAt)));

    const avgReviewTime = helpers.getAverage(reviewTimes);
    const stdevReviewTime = helpers.getStandardDeviation(reviewTimes, avgReviewTime);

    return {
        name: name,
        reviewCount: reviewTimes.length,
        averageReviewTime: avgReviewTime,
        medianReviewTime: helpers.getMedian(reviewTimes),
        minReviewTime: helpers.getMin(reviewTimes),
        maxReviewTime: helpers.getMax(reviewTimes),
        standardDeviationReviewTime: stdevReviewTime,
        minDeviationReviewTime: avgReviewTime - stdevReviewTime,
        maxDeviationReviewTime: avgReviewTime + stdevReviewTime,
    };
}

function generate(data) {
    const dataDefered = bluebird.defer();
    const reviewsByAuthor = groupReviewsByAuthor(data.pullRequests);

    async.map(
        Object.keys(reviewsByAuthor).sort((a, b) => a.toLowerCase() < b.toLocaleLowerCase() ? -1 : 1),
        (user, callback) => {
            const reviews = reviewsByAuthor[user].reviews;
            async.setImmediate(() => callback(null, Object.assign(calculateStatistics(user, reviews), { reviews })));
        },
        (err, users) => {
            if (err) {
                return dataDefered.reject(new Error('Error generating report data'));
            }

            const allReviews = data.pullRequests.reduce((all, pr) => all.concat(...pr.reviews), []);
            const totals = calculateStatistics('TOTALS', allReviews);
            dataDefered.resolve({
                organization: data.organization,
                repository: data.repository,
                startDate: data.startDate,
                endDate: data.endDate,
                generatedOn: data.generatedOn,
                users: users.filter(user => user.reviewCount > 0),
                totals: totals,
            });
        }
    );
    return dataDefered.promise;
}

module.exports = {
    generate: generate,
};

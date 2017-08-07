'use strict';

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
        .reduce((reviews, pr) => reviews.concat(...pr.reviews), [])
        .reduce((users, review) => {
            const user = users[review.user] || getNewUser(review.user);
            user.reviews.push(review);
            users[review.user] = user;
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
    const reviewsByAuthor = groupReviewsByAuthor(data.pullRequests);

    const users = Object.keys(reviewsByAuthor)
        .sort((a, b) => a.toLowerCase() < b.toLocaleLowerCase() ? -1 : 1)
        .map(user => {
            const reviews = reviewsByAuthor[user].reviews;
            return calculateStatistics(user, reviews);
        });

    const allReviews = data.pullRequests.reduce((all, pr) => all.concat(...pr.reviews), []);
    const totals = calculateStatistics('TOTALS', allReviews);

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

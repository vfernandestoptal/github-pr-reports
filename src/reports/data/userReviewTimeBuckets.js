'use strict';

const async = require('async');
const bluebird = require('bluebird');
const moment = require('moment');
const helpers = require('./helpers');

const configDefaults = {
    bucketSize: 8,
    maxBuckets: 7,
};

function getConfig(config) {
    return {
        bucketSize: config.bucketSize || configDefaults.bucketSize,
        maxBuckets: config.maxBuckets || configDefaults.maxBuckets,
    };
}

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

function calculateStatistics(name, reviews, config) {
    const reviewTimes = reviews
        .filter(review => review.assignedAt && review.submittedAt)
        .map(review => moment.utc(review.submittedAt).diff(moment.utc(review.assignedAt)));

    const timeBuckets = helpers.range(config.maxBuckets)
        .map((_, index) => {
            return {
                minValue: index * config.bucketSize,
                maxValue: index + 1 === config.maxBuckets ? '' : (index + 1) * config.bucketSize,
                count: 0,
            };
        });

    reviewTimes.forEach(time => {
        const bucketIndex = Math.min(Math.floor(moment.duration(time).asHours() / config.bucketSize), config.maxBuckets - 1);
        timeBuckets[bucketIndex].count = timeBuckets[bucketIndex].count + 1;
    });

    return {
        name: name,
        reviewCount: reviewTimes.length,
        buckets: timeBuckets,
    };
}

function generate(data, options) {
    const config = getConfig(options);
    const dataDefered = bluebird.defer();
    const reviewsByAuthor = groupReviewsByAuthor(data.pullRequests);

    async.map(
        Object.keys(reviewsByAuthor).sort((a, b) => a.toLowerCase() < b.toLocaleLowerCase() ? -1 : 1),
        (user, callback) => {
            const reviews = reviewsByAuthor[user].reviews;
            async.setImmediate(() => callback(null, calculateStatistics(user, reviews, config)));
        },
        (err, users) => {
            if (err) {
                return dataDefered.reject(new Error('Error generating report data'));
            }

            const allReviews = data.pullRequests.reduce((all, pr) => all.concat(...pr.reviews), []);
            const totals = calculateStatistics('TOTALS', allReviews, config);
            dataDefered.resolve({
                organization: data.organization,
                repository: data.repository,
                startDate: data.startDate,
                endDate: data.endDate,
                generatedOn: data.generatedOn,
                users: users.filter(user => user.buckets.length > 0),
                totals: totals,
            });
        }
    );
    return dataDefered.promise;
}

module.exports = {
    generate: generate,
};

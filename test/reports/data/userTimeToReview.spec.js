import test from 'ava';

import sut from '../../../src/reports/data/userTimeToReview';
import testData from '../../../datasamples/testPullRequests';

const expectedData = {
    organization: testData.organization,
    repository: testData.repository,
    startDate: testData.startDate,
    endDate: testData.endDate,
    generatedOn: testData.generatedOn,
    totals: {
        name: 'TOTALS',
        reviewCount: 3,
        averageReviewTime: 164156000,
        medianReviewTime: 236265000,
        minReviewTime: 13962000,
        maxReviewTime: 242241000,
        standardDeviationReviewTime: 45082395.769671924,
        minDeviationReviewTime: 119073604.23032808,
        maxDeviationReviewTime: 209238395.76967192,
    },
    users: [
        {
            name: 'IgorMinar',
            reviewCount: 1,
            averageReviewTime: 242241000,
            medianReviewTime: 242241000,
            minReviewTime: 242241000,
            maxReviewTime: 242241000,
            standardDeviationReviewTime: 0,
            minDeviationReviewTime: 242241000,
            maxDeviationReviewTime: 242241000,
            reviews: [
                {
                    url: 'https://github.com/angular/angular/pull/18407',
                    submittedAt: '2017-07-31T18:51:03.000Z',
                    assignedAt: '2017-07-28T23:33:42.000Z',
                    reviewHours: 67.28916666666667,
                },
            ],
        },
        {
            name: 'petebacondarwin',
            reviewCount: 1,
            averageReviewTime: 13962000,
            medianReviewTime: 13962000,
            minReviewTime: 13962000,
            maxReviewTime: 13962000,
            standardDeviationReviewTime: 0,
            minDeviationReviewTime: 13962000,
            maxDeviationReviewTime: 13962000,
            reviews: [
                {
                    url: 'https://github.com/angular/angular/pull/18400',
                    submittedAt: '2017-07-28T18:57:00.000Z',
                    assignedAt: '2017-07-28T15:04:18.000Z',
                    reviewHours: 3.8783333333333334,
                },
            ],
        },
        {
            name: 'vicb',
            reviewCount: 1,
            averageReviewTime: 236265000,
            medianReviewTime: 236265000,
            minReviewTime: 236265000,
            maxReviewTime: 236265000,
            standardDeviationReviewTime: 0,
            minDeviationReviewTime: 236265000,
            maxDeviationReviewTime: 236265000,
            reviews: [
                {
                    url: 'https://github.com/angular/angular/pull/18407',
                    submittedAt: '2017-07-31T17:11:30.000Z',
                    assignedAt: '2017-07-28T23:33:45.000Z',
                    reviewHours: 65.62916666666666,
                },
            ],
        },
    ],
};

test('has a generate method', t => {
    t.is(typeof sut.generate, 'function');
});

test('generate returns a promise', t => {
    const result = sut.generate(testData);
    t.truthy(result);
    t.truthy(result.then);
    t.truthy(result.catch);
});

test('generate returns the correct report data', t => {
    t.plan(2);

    return sut.generate(testData).then(data => {
        t.truthy(data);
        t.deepEqual(data, expectedData);
    });
});

import test from 'ava';

import sut from '../../../src/reports/data/userReviewTimeBuckets';
import testData from '../../../datasamples/testPullRequests';

const expectedData = {
    organization: testData.organization,
    repository: testData.repository,
    startDate: testData.startDate,
    endDate: testData.endDate,
    generatedOn: testData.generatedOn,
    totals: {
        buckets: [
            {
                count: 1,
                maxValue: 8,
                minValue: 0,
            },
            {
                count: 2,
                maxValue: '',
                minValue: 8,
            },
        ],
        name: 'TOTALS',
        reviewCount: 3,
    },
    users: [
        {
            buckets: [
                {
                    count: 0,
                    maxValue: 8,
                    minValue: 0,
                },
                {
                    count: 1,
                    maxValue: '',
                    minValue: 8,
                },
            ],
            name: 'IgorMinar',
            reviewCount: 1,
        },
        {
            buckets: [
                {
                    count: 1,
                    maxValue: 8,
                    minValue: 0,
                },
                {
                    count: 0,
                    maxValue: '',
                    minValue: 8,
                },
            ],
            name: 'petebacondarwin',
            reviewCount: 1,
        },
        {
            buckets: [
                {
                    count: 0,
                    maxValue: 8,
                    minValue: 0,
                },
                {
                    count: 1,
                    maxValue: '',
                    minValue: 8,
                },
            ],
            name: 'vicb',
            reviewCount: 1,
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

    return sut.generate(testData, { maxBuckets: 2 }).then(data => {
        t.truthy(data);
        t.deepEqual(data, expectedData);
    });
});

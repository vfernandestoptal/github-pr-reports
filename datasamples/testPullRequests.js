const testData = {
    'organization': 'angular',
    'repository': 'angular',
    'startDate': '2017-07-28T00:00:00.000Z',
    'endDate': '2017-07-28T23:59:59.999Z',
    'generatedOn': '2017-08-01T10:00:00.000Z',
    'pullRequests': [
        {
            'url': 'https://github.com/angular/angular/pull/18400',
            'author': 'gkalpak',
            'createdAt': '2017-07-28T15:04:18.000Z',
            'mergedAt': '2017-07-28T22:29:00.000Z',
            'mergedBy': 'alxhub',
            'baseRefName': 'master',
            'headRefName': 'fix-aio-links-with-sym',
            'state': 'MERGED',
            'reviews': [
                {
                    'user': 'petebacondarwin',
                    'submittedAt': '2017-07-28T18:57:00.000Z',
                    'state': 'APPROVED',
                    'assignedAt': '2017-07-28T15:04:18.000Z',
                },
            ],
        },
        {
            'url': 'https://github.com/angular/angular/pull/18407',
            'author': 'jasonaden',
            'createdAt': '2017-07-28T23:33:42.000Z',
            'mergedAt': '2017-08-01T17:44:01.000Z',
            'mergedBy': 'alxhub',
            'baseRefName': 'master',
            'headRefName': 'feat_route_events',
            'state': 'MERGED',
            'reviews': [
                {
                    'user': 'vicb',
                    'assignedAt': '2017-07-28T23:33:45.000Z',
                    'submittedAt': '2017-07-31T17:11:30.000Z',
                    'state': 'COMMENTED',
                },
                {
                    'user': 'IgorMinar',
                    'submittedAt': '2017-07-31T18:51:03.000Z',
                    'state': 'CHANGES_REQUESTED',
                    'assignedAt': '2017-07-28T23:33:42.000Z',
                },
                {
                    'user': 'test',
                    'assignedAt': '2017-07-28T23:33:45.000Z',
                },
            ],
        },
    ],
};

module.exports = testData;

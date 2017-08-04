'use strict';

require('dotenv').config();
const config = require('config');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

const ghTokens = require('./githubTokenService');
const pullRequests = require('./githubPullRequests');

// ghTokens.getToken((err, token) => {
//     if (err) {
//         return console.log('ERROR', err);
//     }

//     pullRequests.getPullRequestsData({
//         token,
//         organization: config.get('project.organization'),
//         repository: config.get('project.repo'),
//         startDate: moment.utc('2017-07-01').startOf('day'),
//         endDate: moment.utc('2017-07-31').endOf('day'),
//     })
//         .then(data => {
//             fs.writeFileSync(
//                 path.join(__dirname, 'pullRequestsData.json'),
//                 JSON.stringify(data),
//                 'utf-8'
//             );
//             generateReport(data);
//         })
//         .catch(error => console.log('ERROR', error));

// });

const dataFile = path.join(__dirname, 'pullRequestsData.json');
const data = JSON.parse(
    fs.readFileSync(dataFile, 'utf-8')
);
generateReport(data);

function generateReport(data) {
    const userTimeToMergeReportData = require('./reports/data/userTimeToMerge');
    const userTimeToMergeReportDisplay = require('./reports/display/userTimeToMerge');

    console.log(
        userTimeToMergeReportDisplay.generate(
            userTimeToMergeReportData.generate(data)
        )
    );
}

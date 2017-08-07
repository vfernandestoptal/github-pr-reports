'use strict';

require('dotenv').config();
const config = require('config');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

const ghTokens = require('./githubTokenService');
const pullRequests = require('./githubPullRequests');

const useLiveData = false;

if (useLiveData) {

    ghTokens.getToken((err, token) => {
        if (err) {
            return console.log('ERROR', err);
        }

        pullRequests.getPullRequestsData({
            token,
            organization: config.get('project.organization'),
            repository: config.get('project.repo'),
            startDate: moment.utc('2017-08').startOf('month'),
            endDate: moment.utc('2017-09').endOf('month'),
        })
            .then(data => {
                fs.writeFileSync(
                    path.join(__dirname, 'pullRequestsData.json'),
                    JSON.stringify(data),
                    'utf-8'
                );
                generateReports(data);
            })
            .catch(error => console.log('ERROR', error));

    });

}
else {

    const dataFile = path.join(__dirname, 'pullRequestsData_2017_Q3.json');
    const data = JSON.parse(
        fs.readFileSync(dataFile, 'utf-8')
    );

    generateReports(data);
}

function generateReports(data) {
    const reports = [
        'userCounts',
        'userTimeToMerge',
        'userTimeToReview',
    ];

    reports.forEach(report => {
        const reportData = require(`./reports/data/${report}`);
        const reportDisplay = require(`./reports/display/${report}`);
        generateReport(reportData, reportDisplay, data);
    });
}

function generateReport(dataProcessor, displayProcessor, data) {
    dataProcessor.generate(data)
        .then(data => console.log(displayProcessor.generate(data)));
}

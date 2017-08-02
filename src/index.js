'use strict';

require('dotenv').config();
const config = require('config');
const moment = require('moment');

const ghTokens = require('./githubTokenService');
const pullRequests = require('./githubPullRequests');

ghTokens.getToken((err, token) => {
    if (err) {
        return console.log('ERROR', err);
    }

    pullRequests.getPullRequestsData({
        token,
        organization: config.get('project.organization'),
        repository: config.get('project.repo'),
        startDate: moment.utc('2017-07-20').startOf('day'),
        endDate: moment.utc('2017-07-31').endOf('day'),
    })
        .then(data => {
            console.log('DATA', JSON.stringify(data, 4));
        })
        .catch(error => console.log('ERROR', error));

});

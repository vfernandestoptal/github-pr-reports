'use strict';

const bluebird = require('bluebird');
const GithubGraphQLApi = require('node-github-graphql');

function get(token) {
    return new GithubGraphQLApi({
        Promise: bluebird,
        token: token,
        // debug: true,
    });
}

module.exports = {
    get: get,
};

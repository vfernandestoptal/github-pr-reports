'use strict';

const GithubGraphQLApi = require('node-github-graphql');

function get(token) {
    return new GithubGraphQLApi({
        token: token,
    });
}

module.exports = {
    get: get,
};

'use strict';

const config = require('config');
const baseUrl = config.get('github.oauth.baseUrl')
const port = Number(config.get('github.oauth.port'));
const loginUri = config.get('github.oauth.loginUri');

const githubOAuth = require('github-oauth')({
    githubClient: config.get('github.api.key'),
    githubSecret: config.get('github.api.secret'),
    baseURL: `${baseUrl}:${port}`,
    loginURI: loginUri,
    callbackURI: config.get('github.oauth.callbackUri'),
    scope: config.get('github.oauth.scopes'), // optional, default scope is set to user
});

function getToken(callback) {
    let browserProc;

    const tokenServer = startTokenServer((err, token) => {
        browserProc && browserProc.kill('SIGINT');
        tokenServer.close(() => {
            if (err) {
                return callback(new Error('Error calling GitHub API'));
            }

            callback(null, token);
        });
    });

    const opn = require('opn');

    opn(`${baseUrl}:${port}${loginUri}`, { wait: false })
        .then(proc => browserProc = proc);
}

function startTokenServer(callback) {
    const httpClose = require('http-close');
    const tokenServer = require('http').createServer((req, res) => {
        if (req.url.match(/login/)) return githubOAuth.login(req, res);
        if (req.url.match(/callback/)) return githubOAuth.callback(req, res);
    });
    httpClose({ timeout: 100 }, tokenServer);
    tokenServer.listen(port);

    githubOAuth.on('error', () => {
        callback(new Error('Error calling GitHub API'));
    });

    githubOAuth.on('token', (token, serverResponse) => {
        serverResponse.end('Thanks! You can now close this window');
        callback(null, token.access_token);
    });

    return tokenServer;
}

module.exports = {
    getToken,
};


// const GithubGraphQLApi = require('node-github-graphql');
// function testGraphQL(token) {
//     console.log('TOKEN', token)
//     const github = new GithubGraphQLApi({
//         Promise: require('bluebird'),
//         token: token,
//         debug: true,
//     });

//     github.query(
//         `
//             {
//                 viewer {
//                 login
//                 }
//             }
//         `
//     )
//         .then(res => {
//             console.log(JSON.stringify(res, null, 2));
//         })
//         .catch(err => {
//             console.log('ERROR', err);
//         });
// }

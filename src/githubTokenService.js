'use strict';

const config = require('config');
const baseUrl = config.get('github.oauth.baseUrl');
const port = Number(config.get('github.oauth.port'));
const loginUri = config.get('github.oauth.loginUri');
const apiKey = config.get('github.api.key');
const apiSecret = config.get('github.api.secret');

const githubOAuth = require('github-oauth')({
    githubClient: apiKey,
    githubSecret: apiSecret,
    baseURL: `${baseUrl}:${port}`,
    loginURI: loginUri,
    callbackURI: config.get('github.oauth.callbackUri'),
    scope: config.get('github.oauth.scopes'), // optional, default scope is set to user
});

function getToken(callback) {
    if (!apiKey || !apiSecret) {
        return callback(new Error('No Api key/secret specified. Please set GITHUB_API_KEY and GITHUB_API_SECRET env variables.'));
    }

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
    getToken: getToken,
};

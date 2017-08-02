'use strict';

require('dotenv').config();

const ghTokens = require('./githubTokenService');

ghTokens.getToken((err, token) => {
    console.log('TOKEN', token);
});

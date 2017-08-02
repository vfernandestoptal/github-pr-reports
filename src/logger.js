'use strict';

const Winston = require('winston');
const config = require('config');

const logger = new Winston.Logger({
    transports: [
        new Winston.transports.Console({
            level: config.get('logger.level') || 'info',
            handleExceptions: true,
            json: false,
            colorize: true,
        }),
    ],
});

module.exports = logger;

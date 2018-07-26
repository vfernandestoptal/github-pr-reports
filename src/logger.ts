import Winston from 'winston';
import config from 'config';

import AppLogger from './types/AppLogger';

const logger: AppLogger = Winston.createLogger({
    format: Winston.format.combine(
        Winston.format.colorize(),
        Winston.format.simple()
    ),
    transports: [
        new Winston.transports.Console({
            level: config.get('logger.level') || 'info',
            handleExceptions: true,
        }),
    ],
});

// for compatibility with existing require() calls
export = logger;

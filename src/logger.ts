import Winston from 'winston';
import config from 'config';

import AppLogger from './types/AppLogger';

const logger: AppLogger = Winston.createLogger({
    transports: [
        new Winston.transports.Console({
            level: config.get('logger.level') || 'info',
            handleExceptions: true,
        }),
    ],
});

// for compatibility with existing require() calls
export = logger;

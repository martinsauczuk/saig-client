const { createLogger, format, transports } = require('winston');
// var expressWinston = require('express-winston');

const logger = createLogger({
  level: 'http',
  format: format.combine(
    format.simple(),
    format.timestamp(),
    format.printf(log => `[${log.timestamp}] [${log.level}] ${log.message}`),
    format.errors({ stack: true }),
    // format.splat(),
    // format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/saig-client-error.log', level: 'error' }),
    new transports.File({ filename: 'logs/saig-client-http.log', level: 'http' }),
    new transports.File({ filename: 'logs/saig-client.log' })
  ]
});

  // const logger = createLogger({
  //   transports: [
  //     new transports.Console()
  //   ],
  //   format: format.combine(
  //     format.colorize(),
  //     format.json()
  //   )
  // });



// module.exports = logger;
module.exports = logger;


// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.simple(),
      format.colorize(),
      format.printf(log => `[${log.timestamp}] [${log.level}] ${log.message}`),
    )
  }));
}

// ***************
// Allows for JSON logging
// ***************

// logger.log({
//   level: 'info',
//   message: 'Pass an object and this works',
//   additional: 'properties',
//   are: 'passed along'
// });

// logger.info({
//   message: 'Use a helper method if you want',
//   additional: 'properties',
//   are: 'passed along'
// });

// ***************
// Allows for parameter-based logging
// ***************

// logger.log('info', 'Pass a message and this works', {
//   additional: 'properties',
//   are: 'passed along'
// });

// logger.info('Use a helper method if you want', {
//   additional: 'properties',
//   are: 'passed along'
// });

// ***************
// Allows for string interpolation
// ***************

// info: test message my string {}
// logger.log('info', 'test message %s', 'my string');

// info: test message my 123 {}
// logger.log('info', 'test message %d', 123);

// info: test message first second {number: 123}
// logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });

// prints "Found error at %s"
// logger.info('Found %s at %s', 'error', new Date());
// logger.info('Found %s at %s', 'error', new Error('chill winston'));
// logger.info('Found %s at %s', 'error', /WUT/);
// logger.info('Found %s at %s', 'error', true);
// logger.info('Found %s at %s', 'error', 100.00);
// logger.info('Found %s at %s', 'error', ['1, 2, 3']);

// ***************
// Allows for logging Error instances
// ***************

// logger.warn(new Error('Error passed as info'));
// logger.log('error', new Error('Error passed as message'));

// logger.warn('Maybe important error: ', new Error('Error passed as meta'));
// logger.log('error', 'Important error: ', new Error('Error passed as meta'));

// logger.error(new Error('Error as info'));
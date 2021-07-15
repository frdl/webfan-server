

var config = require('./get-configuration');

var winston = require('winston');
  require('winston-syslog').Syslog;
  require('winston-daily-rotate-file');

     //winston.add(new winston.transports.Syslog());

  var transport = new winston.transports.DailyRotateFile(config.logrotate);

  transport.on('rotate', function(oldFilename, newFilename) {
    // do something fun
      console.log('Log rotation: ', [oldFilename, newFilename]);
  });

  var logger = winston.createLogger({
    transports: [
      transport,
      new winston.transports.Syslog()
    ]
  });

  logger.info('Logging started');


module.exports=logger;



var winston = require('winston');
  require('winston-syslog').Syslog;
  require('winston-daily-rotate-file');

     //winston.add(new winston.transports.Syslog());

  var transport = new winston.transports.DailyRotateFile({
    dirname: __dirname + '/logs.userlogs/',
    filename: 'webfan-server-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  });

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

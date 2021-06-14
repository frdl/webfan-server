

var winston = require('winston');
  require('winston-daily-rotate-file');

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
  });

  var logger = winston.createLogger({
    transports: [
      transport
    ]
  });

  logger.info('Logging started');


module.exports=logger;

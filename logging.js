

var config = require('./get-configuration');
var fs = require('fs');
var winston = require('winston');
  require('winston-syslog').Syslog;
  require('winston-daily-rotate-file');

     //winston.add(new winston.transports.Syslog());

  var transport = new winston.transports.DailyRotateFile(config.logrotate);

  transport.on('rotate', function(oldFilename, newFilename) {
      const json2html = require('node-json2html');
      var html = json2html.transform(JSON.parse(fs.readFileSync(oldFilename)),{"<>":"li","html":"<small>${index}</small><pre>${value}</pre>"});
      if(fs.existsSync(oldFilename+'.prev.html')){
         fs.unlink(oldFilename+'.prev.html');
      }
      fs.writeFileSync(newFilename+'.prev.html', html);
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

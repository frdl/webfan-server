

var fs = require('fs');
var deepMerge = require('@betafcc/deep-merge');
var ip = require('ip');

const arrayDeepMerge = deepMerge.addCase(
    [Array.isArray, Array.isArray],
    (a, b) => a.concat(b)
);



var myIp = ip.address();

//var target = '212.72.182.211';
var target = 'https://frdl.ws/frdlwebuserworkspace/default.domain';

var Port = process.env.port;

//var target = '212.72.182.211';
var target = 'https://frdl.ws/frdlwebuserworkspace';

var config = {
 vhosts : {
	//balancers : ['localhost:6000', 'localhost:6001', 'localhost:6002'],
	balancers : [],
	dir : __dirname + '/www/vhosts/',
	proxyfile : 'proxy.json',
	proxymodule : 'proxyhandler',
	docroot : 'httpdocs',
	default : {
		  port : Port,
		  target : target
	}
 },
 proxy :  {
  http: {
    port: 8080,
    websockets: false
  },
  http2: {
    port: 80,
    websockets: false
  },
  https: {
    port: 443,
    websockets: false
  //  key: '/Users/tcoats/MetOcean/tugboat/harmony/metoceanview.com.key',
  //  cert: '/Users/tcoats/MetOcean/tugboat/harmony/metoceanview.com.crt'
  },
  proxy : {
	   xfwd: false,
           prependPath: false  // ,
       //    keepAlive: false
  }
 },
 logrotate:{
    dirname: (fs.existsSync(  process.cwd() + '/logs.userlogs/')) ?   process.cwd() + '/logs.userlogs/' :  __dirname + '/logs.userlogs/',
    filename: 'webfan-server-%DATE%.log.txt',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '4096k',
    maxFiles: '7d'
  }
};


//var config = require('./webfan-server.config');
var configfile = process.cwd() +'/webfan-server.config';
var configfile2 = __dirname +'/webfan-server.config';

	  iif(fs.existsSync(configfile)){
		  config = deepMerge(config, require(configfile.substr(0,configfile.length-3)));
	  }else if(fs.existsSync(configfile2)){
		  config = deepMerge(require(configfile2.substr(0,configfile2.length-3)));
	  }else if(fs.existsSync(configfile + '.js')){
		  config = deepMerge(config, require(configfile));
	  }else if(fs.existsSync(configfile2 + '.js')){
		  config = deepMerge(require(configfile2));
	  }


module.exports=config;

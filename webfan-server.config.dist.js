


var ip = require('ip');
var myIp = ip.address();

var Port = process.env.port;

var target = '212.72.182.211';
//var target = 'https://frdl.ws/frdlwebuserworkspace';

var config = {
 vhosts : {
	//balancers : ['localhost:6000', 'localhost:6001', 'localhost:6002'],
	balancers : [],
	dir : __dirname + '/www/vhosts/',
	proxyfile : 'proxy.json',
	proxymodule : 'proxyhandler.js',
	domainmetrics : '.metrics.js',
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
    frequency : '1h',	 
    dirname: (fs.existsSync(  process.cwd() + '/logs.userlogs/')) ?   process.cwd() + '/logs.userlogs/' :  __dirname + '/logs.userlogs/',
    filename: `webfan-server-${Port}-%DATE%.log.txt`,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '4096k',
    maxFiles: '7d'
  }
};

module.exports = config;

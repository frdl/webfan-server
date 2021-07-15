


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
 }
};

module.exports = config;

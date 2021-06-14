

var ip = require('ip');
var myIp = ip.address();

var fallbackPort = 8082;
var config = {
 vhosts : {
	dir : __dirname + '/www/vhosts/',
	proxyfile : 'proxy.json',
	docroot : 'httpdocs',
	default : {
		  port : fallbackPort,
		//  target :myIp !== process.env.host ?  myIp +':'+ fallbackPort.toString() : '212.72.182.211'
	    	//target : myIp +':'+ fallbackPort.toString()
		  target:'212.72.182.212'
	}
 },
 proxy :  {
  http: {
    port: 80,
    websockets: false
  },

  https: {
    port: 443//,
  //  key: '/Users/tcoats/MetOcean/tugboat/harmony/metoceanview.com.key',
  //  cert: '/Users/tcoats/MetOcean/tugboat/harmony/metoceanview.com.crt'
  },
  proxy : {
	xfwd: true,
        prependPath: true,
        keepAlive: false
  }
 }
};

module.exports = config;

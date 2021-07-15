

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
 }
};


//var config = require('./webfan-server.config');
var configfile = process.cwd() +'/webfan-server.config';
var configfile2 = __dirname +'/webfan-server.config';

	  if('object'===typeof conf && null!==conf && !Array.isArray(conf)){
		  config = deepMerge(config, conf);
	  }else if('string'===typeof conf && fs.existsSync(conf)){
		  config = deepMerge(config, require(conf.substr(0, conf.length-3)));
	  }else if('string'===typeof conf && fs.existsSync(conf + '.js')){
		  config = deepMerge(config, require(conf));
	  }else if(fs.existsSync(configfile + '.js')){
		  config = deepMerge(config, require(configfile));
	  }else if(fs.existsSync(configfile2 + '.js')){
		  config = deepMerge(require(configfile2));
	  }


module.exports=config;

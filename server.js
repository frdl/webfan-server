

if (typeof(PhusionPassenger) != 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}


var fs = require('fs');
var url = require('url');
var http = require('http');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');
var deepMerge = require('@betafcc/deep-merge');
var Redwire = require('redwire');

var ip = require('ip');

const arrayDeepMerge = deepMerge.addCase(
    [Array.isArray, Array.isArray],
    (a, b) => a.concat(b)
);



var myIp = ip.address();

var fallbackPort = 8082;

var config = {
 vhosts : {
	dir : __dirname + '/www/vhosts/',
	proxyfile : 'proxy.json',
	docroot : 'httpdocs',
	default : {
		  port : fallbackPort,
		  target : 'https://' + myIp +':' + fallbackPort.toString()
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
        keepAlive: true
  }
 }
};


//var config = require('./webfan-server.config');
var configfile = process.cwd() +'/webfan-server.config';
var configfile2 = __dirname +'/webfan-server.config';

	  if(fs.existsSync(configfile + '.js')){
		  config = arrayDeepMerge(config, require(configfile));
	  }else if(fs.existsSync(configfile2 + '.js')){
		  config = arrayDeepMerge(config, require(configfile2));
	  }else{
                
          }


var options = config.proxy;

var redwire = new Redwire(options);






var url_parse = url.parse;
var def = url_parse(config.vhosts.default.target);
var wildcard=
 redwire .http('*')
  .use(function(mount, url, req, res, next) {
	
           var done = finalhandler(req, res);

           var pieces = url_parse(url);
	   var rule = config.vhosts.default.target;
	  
    // req.target is what redwire.proxy() uses to proxy to
	  var dns = pieces.host.split(/\./).reverse();
	  var domain =  dns[1] + '.' + dns[0];
	 var domainfile = config.vhosts.dir + domain+'/'+config.vhosts.proxyfile;	 
	 var subdomainfile = config.vhosts.dir +domain+'/'+pieces.host+'/'+config.vhosts.proxyfile;  

	 var docroot = config.vhosts.dir + domain+'/'+config.vhosts.docroot;
	 var docroot2 = config.vhosts.dir + domain+'/'+pieces.host+'/'+config.vhosts.docroot;

	  if(fs.existsSync(subdomainfile)){
		  rule.target = require(domainfile).target;
	  }else if(fs.existsSync(domainfile)){
		   rule.target = require(subdomainfile).target;
	  }else if(fs.existsSync(docroot2)){
		   redwire.setHost(req.host).apply(this, arguments);
		   return serveStatic(docroot2)(req, res, done);
	  }else if(fs.existsSync(docroot)){
		   redwire.setHost(req.host).apply(this, arguments);
		   return serveStatic(docroot)(req, res, done);
	  }
	  
	  
        req.target =rule.target;
	  
	    var tpath =   url_parse(rule.target);
	    redwire.setHost(tpath.host).apply(this, arguments);

	 // next();
  })
 .use(redwire.setHost(def.host))
 .use(redwire.proxy());


var serve = serveStatic(config.vhosts.dir + '_._/' + config.vhosts.docroot);

var localhostServer = http.createServer(function(req, res) {
   var done = finalhandler(req, res);
  return serve(req, res, done);
});//.listen(config.vhosts.default.port);


if (typeof(PhusionPassenger) != 'undefined') {
    localhostServer.listen('passenger');
} else {
    localhostServer.listen(config.vhosts.default.port);
}

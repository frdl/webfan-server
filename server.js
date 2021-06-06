

var http = require('http');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

var Redwire = require('redwire');

var ip = require('ip');
var config = require('./webfan-server.config');


var options = config.proxy;

var redwire = new Redwire(options);
var url = require('url');

var url_parse = url.parse;
var def = url_parse(config.vhosts.default.target);
var wildcard=
 redwire .http('*')
  .use(function(mount, url, req, res, next) {
	 
    var pieces = url_parse(url);
	   var rule = config.vhosts.default.target;
	  
    // req.target is what redwire.proxy() uses to proxy to
	  var dns = pieces.host.split(/\./).reverse();
	  var domain =  dns[1] + '.' + dns[0];
	 var domainfile = config.vhosts.dir + domain+'/'+config.vhosts.proxyfile;	 
	 var subdomainfile = config.vhosts.dir +domain+'/'+pieces.host+'/'+config.vhosts.proxyfile;  
	
	  if(fs.existsSync(domainfile)){
		  rule.target = require(domainfile).target;
	  }else if(fs.existsSync(subdomainfile)){
		   rule.target = require(subdomainfile).target;
	  }
	  
	  
        req.target =rule.target;
	  
	    var tpath =   url_parse(rule.target);
	    redwire.setHost(tpath.host).apply(this, arguments);

	 // next();
  })
 .use(redwire.setHost(def.host))
  .use(redwire.proxy());



var serve = serveStatic(config.vhosts.dir + '_._/' + config.vhosts.docroot);

http.createServer(function(req, res) {
  return serve(req, res, finalhandler(req, res));
}).listen(config.vhosts.default.port);


/*
if (typeof(PhusionPassenger) != 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}
*/
var fs = require('fs');
var url = require('url');
var http = require('http');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');
var deepMerge = require('@betafcc/deep-merge');
var Redwire = require('redwire');
var url_parse = url.parse;
var ip = require('ip');
var logger=require('./logging');

const arrayDeepMerge = deepMerge.addCase(
    [Array.isArray, Array.isArray],
    (a, b) => a.concat(b)
);



var myIp = ip.address();

var target = '212.72.182.211';
if(myIp === target){
	target='212.72.182.212';
}


var fallbackPort = 80;

var config = {
 vhosts : {
	dir : __dirname + '/www/vhosts/',
	proxyfile : 'proxy.json',
	proxymodule : 'proxyhandler',
	docroot : 'httpdocs',
	default : {
		  port : fallbackPort,
		   target : target+':'+ fallbackPort.toString()
	    	//target : myIp +':'+ fallbackPort.toString()
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
        prependPath: false  // ,
          // keepAlive: false
  }
 }
};


//var config = require('./webfan-server.config');
var configfile = process.cwd() +'/webfan-server.config';
var configfile2 = __dirname +'/webfan-server.config';

	  if(fs.existsSync(configfile + '.js')){
		  config = deepMerge(config, require(configfile));
	  }else if(fs.existsSync(configfile2 + '.js')){
		  config = deepMerge(require(configfile2));
	  }else{
                
          }


var options = config.proxy;


var def = url_parse(config.vhosts.default.target);

var redwire = new Redwire(options);


var wildCardHandler = (mount, url, req, res, next)=>{
	
           logger.info('Hit: ', [mount, url]);

      var pieces = url_parse(url);	
      var dns = pieces.host.split(/\./).reverse();
	  var domain =  dns[1] + '.' + dns[0];
	  var host = pieces.host;
	
	   var rule = {
		   target: config.vhosts.default.target//,
		//   host : host
	   };
	  
    // req.target is what redwire.proxy() uses to proxy to

	 var domainfile = config.vhosts.dir + domain+'/'+config.vhosts.proxyfile;	 
	 var subdomainfile = config.vhosts.dir +domain+'/'+host+'/'+config.vhosts.proxyfile;
	
	
	 var domainproxymodule = config.vhosts.dir + domain+'/'+config.vhosts.proxymodule;	 
	 var subdomainproxymodule = config.vhosts.dir +domain+'/'+host+'/'+config.vhosts.proxymodule;  

	 var docroot = config.vhosts.dir + domain+'/'+config.vhosts.docroot;
	 var docroot2 = config.vhosts.dir + domain+'/'+host+'/'+config.vhosts.docroot;

	if(fs.existsSync(subdomainproxymodule + '.js')){
		  var handler = require(subdomainproxymodule);
		  rule = handler(mount, url, req, res, next);
		    logger.info('Hit subdomainproxymodule: ', {subdomainproxymodule:subdomainproxymodule, mount:mount, url:url});
			 //   var tpath =   url_parse(rule.target);
	         //   req.host=tpath.host;  
	  }else 

	if(fs.existsSync(domainproxymodule + '.js')){
		  var handler = require(domainproxymodule);
		  rule = handler(mount, url, req, res, next);
		    logger.info('Hit domainproxymodule: ', {domainproxymodule:domainproxymodule, mount:mount, url:url});
			//    var tpath =   url_parse(rule.target);
	       //     req.host=tpath.host;  
	  }else 
		  
	  if(fs.existsSync(subdomainfile)){
		  rule = require(subdomainfile);
		    logger.info('Hit subdomainfile: ', {subdomainfile:subdomainfile, mount:mount, url:url});
		//  if('undefined'===typeof rule.host){
		//	    var tpath =   url_parse(rule.target);
	   //         rule.host=tpath.host;  
		//  }
	  }else if(fs.existsSync(domainfile)){
		   rule = require(domainfile);
		      //var tpath =   url_parse(rule.target);
	         ///   req.host=tpath.host; 
		    logger.info('Hit domainfile: ', {domainfile:domainfile, mount:mount, url:url});
		 // if('undefined'===typeof rule.host){
		//	    var tpath =   url_parse(rule.target);
	    //        rule.host=tpath.host;  
		//  }		  
	  }/*else if(fs.existsSync(docroot2)){
		  var done = finalhandler(req, res);
		   redwire.setHost(req.host).apply(this, arguments);
		   return serveStatic(docroot2)(req, res, done);
	  }else if(fs.existsSync(docroot)){
		  var done = finalhandler(req, res);
		   redwire.setHost(req.host).apply(this, arguments);
		   return serveStatic(docroot)(req, res, done);
	  }*/
	  
	  //  logger.info('Hit rule: ', {rule:rule, mount:mount, url:url});
        req.target =rule.target;
			  
	       if('string'===typeof rule.host){
			     // mount.setHost(rule.host);
			    //  redwire.setHost(rule.host).apply(this, arguments);
			    req.host = rule.host;
		  	  //    redwire.setHost(rule.host).apply(this, arguments);
		   }

       //   req.host =('undefined'===typeof rule.host) ? req.host : rule.host;
	   //   redwire.setHost(req.host).apply(this, arguments);
	    logger.info('Hit target: ', {req:req, mount:mount, url:url});
	  
	   //  redwire.setHost(tpath.host).apply(this, arguments);
    //         redwire.setHost(pieces.host).apply(this, arguments);
	  next();
};




var wildcardHTTP2=
 redwire .http2('*')
 .use(wildCardHandler)
 //.use(redwire.setHost(def.host))
 .use(redwire.proxy());

var wildcardHTTP=
 redwire .http('*')
 .use(wildCardHandler)
 //.use(redwire.setHost(def.host))
 .use(redwire.proxy());

var wildcardHTTPS=
 redwire .https('*')
 .use(wildCardHandler)
 //.use(redwire.setHost(def.host))
 .use(redwire.proxy());

 /* 
var serve = serveStatic(config.vhosts.dir + '_._/' + config.vhosts.docroot);
	
 var localhostServer = http.createServer(function(req, res) {
    var done = finalhandler(req, res);
    return serve(req, res, done);
 });//.listen(config.vhosts.default.port);
  
   localhostServer.listen(config.vhosts.default.port);
if (typeof(PhusionPassenger) != 'undefined') {	
    localhostServer.listen('passenger');
} else {
    localhostServer.listen(config.vhosts.default.port);
}
*/

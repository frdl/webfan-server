 
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


const arrayDeepMerge = deepMerge.addCase(
    [Array.isArray, Array.isArray],
    (a, b) => a.concat(b)
);


module.exports.create = conf => {
'use strict';
	
	var that=this;
	//var logger=require('./logging');
	var logger=this.logger;
	
var myIp = ip.address();

//var target = '212.72.182.211';
var target = 'https://frdl.ws/frdlwebuserworkspace/default.domain';

var Port = process.env.port;

//var target = '212.72.182.211';
var target = 'https://frdl.ws/frdlwebuserworkspace';

var config = deepMerge(require('./get-configuration'), this.config || {});

	  if('object'===typeof conf && null!==conf && !Array.isArray(conf)){
		  config = deepMerge(config, conf);
	  }else if('string'===typeof conf && fs.existsSync(conf)){
		  config = deepMerge(config, require(conf.substr(0, conf.length-3)));
	  }else if('string'===typeof conf && fs.existsSync(conf + '.js')){
		  config = deepMerge(config, require(conf));
	  }


var options = config.proxy;


var def = url_parse(config.vhosts.default.target);

var redwire = new Redwire(options);


function wildCardHandler(mount, url, req, res, next)=>{
	
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
 
	
	if(fs.existsSync(docroot2)){
		  var done = finalhandler(req, res);
		   return serveStatic(docroot2)(req, res, done);
	  }else if(fs.existsSync(docroot)){
		  var done = finalhandler(req, res);
		   return serveStatic(docroot)(req, res, done);
	  }else	if(fs.existsSync(subdomainproxymodule + '.js') || fs.existsSync(subdomainproxymodule)){
		  var handler = require(subdomainproxymodule);
		  rule = handler(mount, url, req);
		    logger.info('Hit subdomainproxymodule: ', {subdomainproxymodule:subdomainproxymodule, mount:mount, url:url});
	  }else if(fs.existsSync(domainproxymodule + '.js') || fs.existsSync(domainproxymodule)){
		  var handler = require(domainproxymodule);
		  rule = handler(mount, url, req);
		    logger.info('Hit domainproxymodule: ', {domainproxymodule:domainproxymodule, mount:mount, url:url}); 
	  }else if(fs.existsSync(subdomainfile)){
		  rule = require(subdomainfile);
		    logger.info('Hit subdomainfile: ', {subdomainfile:subdomainfile, mount:mount, url:url});
	  }else if(fs.existsSync(domainfile)){
		   rule = require(domainfile);
		    logger.info('Hit domainfile: ', {domainfile:domainfile, mount:mount, url:url});	  
	  }
	  
	  //  logger.info('Hit rule: ', {rule:rule, mount:mount, url:url});
                  req.target = rule.target;
			  
	          if('string'===typeof rule.host){
			    req.host = rule.host;
		   }
	          if('string'===typeof rule.url){
			    req.url = rule.url;
		   }
	
	    logger.info('Hit target: ', {req:req, mount:mount, url:url});
	  
	   //  redwire.setHost(tpath.host).apply(this, arguments);
    //         redwire.setHost(pieces.host).apply(this, arguments);
	 return next();
}


	
function __frdl_decache(route, target){
	
}
	
 if(0<config.balancers.length){
    var load = redwire.loadBalancer();

	config.balancers.forEach(t=>{
            load.add(t);
	});
 }


	
[['http', '*'],['http2','*'], ['https', '*']].forEach(info=>{
	
	var app = redwire[info[0]](info[1]);
	
	app.use(wildCardHandler);

	if(0<config.balancers.length && 'undefined'!==typeof load && 'function'===typeof load.distribute){
		app.use(load.distribute());
	}	
	
	app.use(redwire.proxy());

	
	app.__frdl_decache = __frdl_decache;
	
	that.apps = {
	      name : 'ReverseProxyServerOfRedwirewildcard' + info[0].toUpperCase() + that.apps.length,
	      type : ['server', 'proxy/redwire', info[0]],
	      app : app
	};	
});
	 

	
 return this;
};

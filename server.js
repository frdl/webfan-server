 
/*
if (typeof(PhusionPassenger) != 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}
*/
var fs = require('fs');
var Url = require('url');
var http = require('http');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');
var deepMerge = require('@betafcc/deep-merge');
var Redwire = require('redwire');
var url_parse = Url.parse;
var ip = require('ip');
var requestIp = require('request-ip');
var net = require('net');
var mkdir = require('mkdir');
var path = require('path');

const arrayDeepMerge = deepMerge.addCase(
    [Array.isArray, Array.isArray],
    (a, b) => a.concat(b)
);
const decache = require('decache');

module.exports.create = (conf, T) => {
'use strict';

 var that=T;
//var ip =that.ip;
	//var logger=require('./logging');
//var logger=that.logger;
//var Redwire = that.redwire;	
var myIp = ip.address();
//var finalhandler = that.finalhandler;
//var target = '212.72.182.211';
//var target = 'https://frdl.ws/frdlwebuserworkspace/default.domain';

	
var Port = process.env.port;

//var target = '212.72.182.211';
var _target = 'https://frdl.ws/frdlwebuserworkspace';

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

	

	
function getHostFiles(mount, url, req){
      var pieces = url_parse(url);	
      var dns = (pieces.host || req.host).split(/\./).reverse();
	  var domain =  dns[1] + '.' + dns[0];
	  var host = pieces.host;	
	

	 var domainmetrics = config.vhosts.dir + domain+'/.webfan/meta/'+config.vhosts.domainmetrics;	 
	 var subdomainmetrics = config.vhosts.dir +domain+'/'+host+'/.webfan/meta/'+config.vhosts.domainmetrics;	
	
	 var domainfile = config.vhosts.dir + domain+'/'+config.vhosts.proxyfile;	 
	 var subdomainfile = config.vhosts.dir +domain+'/'+host+'/'+config.vhosts.proxyfile;
	
	
	 var domainproxymodule = config.vhosts.dir + domain+'/'+config.vhosts.proxymodule;	 
	 var subdomainproxymodule = config.vhosts.dir +domain+'/'+host+'/'+config.vhosts.proxymodule;  

	 var docroot = config.vhosts.dir + domain+'/'+config.vhosts.docroot;
	 var docroot2 = config.vhosts.dir + domain+'/'+host+'/'+config.vhosts.docroot;
	
	
var exp = {
domain : {
	name : domain,
	mount : {
		vhost : {
		   file : docroot,
		   exists : fs.existsSync(docroot)
		},
		router : {
		   file : domainproxymodule,
		   exists : fs.existsSync(domainproxymodule)
		},
		config : {
		   file : domainfile,
		   exists : fs.existsSync(domainfile)
		},
		metrics : {
		   file : domainmetrics,
		   exists : fs.existsSync(domainmetrics)
		}
		
	}	
},
host :  {
	name : host,
	mount : {

		vhost : {
		   file : docroot2,
		   exists : fs.existsSync(docroot2)
		},
		router : {
		   file : subdomainproxymodule,
		   exists : fs.existsSync(subdomainproxymodule)
		},
		config : {
		   file : subdomainfile,
		   exists : fs.existsSync(subdomainfile)
		},
		metrics : {
		   file : subdomainmetrics,
		   exists : fs.existsSync(subdomainmetrics)
		}		
	}	
},
	
	route : {
		url : url,
		parsed : pieces,
		dns:dns
	}
	
  };
	
   return exp;
}
	
	
function wildCardHandler(mount, url, req, res, next){
	
           logger.info('Hit: ', [mount, url]);
	 
	   var Metafiles = getHostFiles(mount, url, req);	
	
	   var target = _target;
	   try{
		    if('string'===typeof config.vhosts.default.target){
			target =config.vhosts.default.target;     
		    }
	   }catch(_e){
		   
	   }
	   var rule = {
		   target: target
		//  , host : host
	   };
	  
		   
	if(true===Metafiles.host.mount.router.exists){
		  var file = Metafiles.host.mount.router.file;
		  var handler = require(file.substr(0,file.length-3));
		  rule =  deepMerge(rule, handler(mount, url, req));
	  }else	if(true===Metafiles.domain.mount.router.exists){
		  var file = Metafiles.domain.mount.router.file;
		  var handler = require(file.substr(0,file.length-3));
		  rule =  deepMerge(rule, handler(mount, url, req));
	  }else if(true===Metafiles.host.mount.config.exists){
		 rule = deepMerge(rule, require(Metafiles.host.mount.config.file));
	  }else	if(true===Metafiles.domain.mount.config.exists){
		 rule = deepMerge(rule,  require(Metafiles.domain.mount.config.file));
	  }
	
	  //  logger.info('Hit rule: ', {rule:rule, mount:mount, url:url});
                  req.target = rule.target;
			  
	          if('string'===typeof rule.host){
			    req.host = rule.host;
		   }
	          if('string'===typeof rule.url){
			    req.url = rule.url;
		   }
		   if(true===typeof rule.xfwd){
			 res.headers['x-forwarded-host'] = req.host;
			 res.headers['x-forwarded-for'] = req.reqIp;  
		   }
	
	    logger.info('Hit target: ', {req:req, mount:mount, url:url, fromIp:req.reqIp});		
	
	//req.reqIp
          if(true!==Metafiles.host.mount.metrics.exists){
		mkdir(path.dirname(Metafiles.host.mount.metrics.file));
		fs.writeFile(Metafiles.host.mount.metrics.file, JSON.stringify({req:req, mount:mount, url:url, fromIp:req.reqIp}) , e=>{
		   if(e){
			logger.info(e);   
		   }
		});
	  }
	
	  if(true!==Metafiles.domain.mount.metrics.exists){
		mkdir(path.dirname(Metafiles.domain.mount.metrics.file));
		fs.writeFile(Metafiles.domain.mount.metrics.file, JSON.stringify({req:req, mount:mount, url:url, fromIp:req.reqIp}) , e=>{
		   if(e){
			logger.info(e);   
		   }
		});		  
	  }     
	
	  if(true===Metafiles.host.mount.vhost.exists){
		  var done = finalhandler(req, res);
		   return serveStatic(Metafiles.host.mount.vhost.dir || Metafiles.host.mount.vhost.file)(req, res, done);
	  }else if(true===Metafiles.domain.mount.vhost.exists){
		  var done = finalhandler(req, res);
		   return serveStatic(Metafiles.domain.mount.vhost.dir || Metafiles.domain.mount.vhost.file)(req, res, done);
	  }		
	
	   //  redwire.setHost(tpath.host).apply(this, arguments);
    //         redwire.setHost(pieces.host).apply(this, arguments);
    next();
}


	
function __frdl_decache(route, target){
    var pieces = url_parse(route);
    var Metafiles = getHostFiles(route, route, deepMerge(pieces, {
       host : pieces.host,
       url : Url.format(pieces),
       protocol :  pieces.protocol
    }));	
	for(var appService in Metafiles.host.mount){
		if(Metafiles.host.mount[appService].exists){
			try{
			  fs.unlink(Metafiles.host.mount[appService].file);
			  decache(Metafiles.host.mount[appService].file);
			}catch(_e){
			  console.warn(_e);	
			}
		}
		
	}
	for(var appService in Metafiles.domain.mount){
		if(Metafiles.domain.mount[appService].exists){
			try{
			  fs.unlink(Metafiles.domain.mount[appService].file);
			  decache(Metafiles.domain.mount[appService].file);
			}catch(_e){
			  console.warn(_e);	
			}
		}
		
	}	
	
}
	
 if(0<config.balancers.length){
    var load = redwire.loadBalancer();

	config.balancers.forEach(t=>{
            load.add(t);
	});
 }

	if(T.apps)that.apps = {
	      name : 'RedwireReverseProxyServer' + that.apps.length,
	      type : ['server', 'proxy/redwire', 'Redwire'],
	      app : redwire
	};	
	
[['http', '*'],['http2','*'], ['https', '*']].forEach(info=>{
	
	var app = redwire[info[0]](info[1]);
	app.use(requestIp.mw({ attributeName : 'reqIp' }));
	app.use(function(mount, url, req, res, next) {
               // use our custom attributeName that we registered in the middleware
               var ip = req.reqIp;
              // https://nodejs.org/api/net.html#net_net_isip_input
              var ipType = net.isIP(ip); // returns 0 for invalid, 4 for IPv4, and 6 for IPv6
             if(0==ipType){
		logger.warn('Invalid IP access atempt: ' + ip,    {req:req, mount:mount, url:url, ip:ip});   
		res.end('Invalid IP access atempt: ' + ip);
	     }else{
		next();     
	     }
	});
	app.use(wildCardHandler);

	if(0<config.balancers.length && 'undefined'!==typeof load && 'function'===typeof load.distribute){
		app.use(load.distribute());
	}	
	
	app.use(redwire.proxy());

	
	app.__frdl_decache = __frdl_decache;
	
	if(T.apps)T.apps = {
	      name : 'WildcardMountOfRedwire' + info[0].toUpperCase() + 'Server' + T.apps.length,
	      type : ['app', 'proxy/redwire', info[0]],
	      app : app
	};	
});
	 

	
 return this;
};

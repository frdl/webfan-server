
'use strict';

var typeHashRegex = /([\#\s\/\.\:])|(\-\>)|(\:\:)/;
var deepMerge = require('@betafcc/deep-merge');
const arrayDeepMerge = deepMerge.addCase(
    [Array.isArray, Array.isArray],
    (a, b) => a.concat(b)
);

var prop = Object.defineProperty;
const ServersApps = new WeakMap();

function swapObjectFlip(obj) {
  return Object.keys(obj).reduce((ret, key) => {
    ret[obj[key]] = key;
    return ret;
  }, {});
}

function Server(){
  
}

const _methdoAlias ={
	'stop': 'close',
	'start': 'listen',
	'unregister' : '__frdl_decache'
};
Server.prototype.callBackApp =  (app, cb, args) =>{
	 var that=this, alias2 = swapObjectFlip(_methdoAlias);
	 if('string'=== typeof cb){
		  if('function'!==typeof app.app[cb]){
			  if('string'===typeof _methdoAlias[cb]){
				  cb = _methdoAlias[cb];
			  }else if('string'===typeof alias2[cb]){
				  cb = alias2[cb];
			  }
		  }
		  if('function'!==typeof app.app[cb]){
			  throw new Error(cb + ' is not a function of '+app.name);
		  }
		  return app.app[cb].apply(app, args);
	  }else if('function'=== typeof cb){
		 return cb.apply(app,args);
	  }else{
	    return app; 
	 }
};


Server.prototype.getApp = (ix, cb, args) =>{
	 var that=this;
		      if(!isNaN(ix)){
				 var app = that.apps[ix];
			         return  that.callBackApp(app, cb, args);
   
		      }else{
			  return that.queryApps(ix, cb, args);    
		      }
};

Server.prototype.queryApps = (arg, cb, args) => {
	var that=this;
		      if(!isNaN(arg)){
				 return that.getApp(arg, cb, args); 
		      }else if('string'===typeof arg){
			     for(var i=0;i<that.apps.length;i++){
				 var app = that.apps[i];
				 if(arg === app.name){
					 that.callBackApp(app, cb, args);
				 }else if('undefined'!==typeof app.type){
				   var type = app.type.split(typeHashRegex);
				   var query = arg.split(typeHashRegex);
				   if((type[0] === query[0] || '*' === query[0]) 
					  && (type[1] === query[1] || '*' === query[1])
					  && ('undefined'===typeof query[2] || type[2] === query[2] || '*' === query[2] || '' === query[2]) ){
				     	that.callBackApp(app, cb, args);
				   }
				 }
			     }
		      }else if('object' === typeof arg && 'undefined'!==typeof arg.key){
			    if('undefined'===typeof arg.value){
				  that.queryApps(arg.key + '#*', cb, args);   
			    }else{
				  for(var i=0;i<that.apps.length;i++){
					 var app = that.apps[i];
					  if('undefined'!==typeof app[arg.key] && app[arg.key] === arg.value){
						   that.getApp(i, cb, args); 
					  }
				   }
			     }
		      }
		  };


Server.prototype.close = arg => {		   
	return this.queryApps(arg, 'close', []);   	
};

Server.prototype.constructor=function(options){
  ServersApps.set(this, {	  
	  apps:[]	  
  });
  var _conf = arrayDeepMerge(require('./get-configuration'), options.config || {});
  var props = {},that=this;


	
	
   prop(that, 'unregister', {
  	get : ()=>{
		  return (route, target) => {
		      that.queryApps('server#proxy/redwire', 'unregister', [route, target]);  
	              that.queryApps('server#proxy/redbird', 'unregister', [route, target]);   
		  };
	  }
  });    
   prop(that, 'unregister', {
  	get : ()=>{
		  return (route, target) => {
		      that.queryApps('server#proxy/redwire', 'unregister', [route, target]);  
	              that.queryApps('server#proxy/redbird', 'unregister', [route, target]);   
		  };
	  }
  });    	
	
  prop(that, 'addApp', {
  	get : ()=>{
		return (app, type, name) => {
			that.apps = {
			    name:name,
				type : type,
				app:app
			};		  
		};
	  }
  });	  
	
  prop(that, 'config', {
  	get : ()=>{
		  return _conf;
	  }
  });		
  prop(that, 'apps', {
  	get : ()=>{
		  return ServersApps.get(that).apps;
	  },
	  set : (app)=>{
		  var s= ServersApps.get(that);
		  var apps = s.apps;
		  if(Array.isArray(app.type)){
		       app.type = app.type.join('#');	  
		  }
		   apps.push({
			    name:app.name || 'App' +  apps.length.toString(),
				type : app.type || 'UNDEFINED#UNDEFINED#UNDEFINED' + apps.length.toString(),
				app:app.app || function(mount, req,res,next){}
			});
		  s.apps = apps;
		   ServersApps.set(that, s);
	  }
  });	  
  prop(that, 'close', {
  	get : ()=>{
		  return arg => {
		      that.queryApps(arg, 'close', ['*.*.*']);   
		  };
	  }
  });    
	
	
  prop(that, 'proxy', {
  	get : ()=>{
      if('undefined'===typeof props.proxy){
        props.proxy =new (that.redbird)({});
      }
		  return props.proxy;
	  },
    set : (conf)=>{      
	  	 props.proxy = new (that.redbird)(conf);
	  }
  });	 
  
  
   prop(that, 'hubbie', {
  	get : ()=>{
      if('undefined'===typeof props.hubbie){
        props.hubbie =require('hubbie');
      }
		  return props.hubbie;
	  },
    set : (conf)=>{      
	  	 props.hubbie =conf;
	  }
  });	 
  
    
  prop(that, 'getLetsEncryptServers', {
  	get : ()=>{
		  return require( "./get-lets-encrypt-servers");
	  }
  });	

   
  
  prop(that, 'logger', {
  	get : ()=>{
      if('undefined'===typeof props.logger){
        props.logger =require('./logging');
      }
		  return props.logger;
	  },
    set : (conf)=>{      
		  props.logger = require('winston').createLogger(conf);
	  }
  });	
  
	return that;
};


Server.prototype.create = (engine) =>{
	switch(engine){
		case 'wire':
		case 'wired':
		  var server = require( "./server-redwire");	  
		break;
		case undefined:
		case 'bird':
		case 'birded':	
		  var server = require( "./server-tg-redbird");	  
		 // var server = require( "tg-redbird");	  
		break;
		default:
		   var server = require( "./server-" + engine);
			//throw new Error(`The server ${engine} is not available`);
		break;
	}
	
	return (conf) =>{
	   return server.create.apply(this,[conf, this]);
        };
};


   prop(Server.prototype, 'greenlock', {
  	get : ()=>{
		  return require( "greenlock");
	  }
  });	  
  prop(Server.prototype, 'redwire', {
  	get : ()=>{
		  return require( "redwire");
	  }
  });	  
  prop(Server.prototype, 'ip', {
  	get : ()=>{
		  return require( "ip");
	  }
  });	   
  
  prop(Server.prototype, 'redbird', {
  	get : ()=>{
		  return require( "redbird");
	  }
  });	  
 
  prop(Server.prototype, 'tgredbird', {
  	get : ()=>{
		  return require( "tg-redbird");
	  }
  });	  

  prop(Server.prototype, 'finalhandler', {
  	get : ()=>{
		  return require( "finalhandler");
	  }
  });	


  prop(Server, 'create', {
  	get : ()=>{
		return options => {
		  return (new Server()).create(options);
		};
	  }
  });	
module.exports = Server;



'use strict';

var prop = Object.defineProperty;



Server.prototype.callBackApp =  (app, cb) =>{
	 var that=this;
	 if('string'=== typeof cb){
					 return that[cb](app);
				 }else if('function'=== typeof cb){
					  return cb(app);
				 }else{
				     return app; 
	}
};


Server.prototype.getApp = (ix, cb) =>{
	 var that=this;
		      if(!isNaN(ix)){
				 var app = that.apps[ix];
			         return  that.callBackApp(app, cb);
   
		      }else{
			  return that.queryApps(ix, cb);    
		      }
};

Server.prototype.queryApps = (arg, cb) => {
	var that=this;
		      if(!isNaN(arg)){
				 return that.getApp(arg, cb); 
		      }else if('string'===typeof arg){
			     for(var i=0;i<that.apps.length;i++){
				 var app = that.apps[i];
				 if(arg === app.name){
					 that.callBackApp(app, cb);
				 }else if('undefined'!==typeof app.type){
				   var type = app.type.split(/[\#\s\/\.]/);
				   var query = arg.split(/\#/);	 
				   if((type[0] === query[0] || '*' === query[0])  && (type[1] === query[1] || '*' === query[1])  && ('undefined'===typeof query[2] || type[2] === query[2] || '*' === query[2] || '' === query[2])) ){
				  	that.callBackApp(app, cb);
				   }
				 }
			     }
		      }else if('object' === typeof arg && 'undefined'!==typeof arg.key){
			  if('undefined'===typeof arg.value){
				that.queryApps(arg.key + '#*', cb);   
			  }else{
				  for(var i=0;i<that.apps.length;i++){
					 var app = that.apps[i];
					  if('undefined'!==typeof app[arg.key] && app[arg.key] === arg.value){
						 return that.getApp(i, cb); 
					  }
				  }
			  }
		      }
		  };


Server.prototype.consruct=()=>{
  

  var props = {},that=this;
  var _apps = [];	
  
		
  prop(this, 'apps', {
  	get : ()=>{
		  return _apps;
	  }
  });	  
  prop(this, 'close', {
  	get : ()=>{
		  return arg => {
		      that.queryApps(arg, 'close');   
		  };
	  }
  });    
  prop(this, 'proxy', {
  	get : ()=>{
      if('undefined'===typeof props.proxy){
        props.proxy =new (this.redbird)({});
      }
		  return props.proxy;
	  },
    set : (conf)=>{      
	  	 props.proxy = new (this.redbird)(conf);
	  }
  });	 
  
  
   prop(this, 'hubbie', {
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
  
    
  prop(this, 'getLetsEncryptServers', {
  	get : ()=>{
		  return require( "./get-lets-encrypt-servers");
	  }
  });	
  prop(this, 'create', {
  	get : ()=>{
	       var fn = require( "./server").create;
		var create = fn.bind(that);
		return create;
	  }
  });	
    prop(this, 'greenlock', {
  	get : ()=>{
		  return require( "greenlock");
	  }
  });	  
  prop(this, 'redwire', {
  	get : ()=>{
		  return require( "redwire");
	  }
  });	  
  prop(this, 'ip', {
  	get : ()=>{
		  return require( "ip");
	  }
  });	   
  
  prop(this, 'redbird', {
  	get : ()=>{
		  return require( "redbird");
	  }
  });	  
  
  prop(this, 'finalhandler', {
  	get : ()=>{
		  return require( "finalhandler");
	  }
  });	   
  
  prop(this, 'logger', {
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
  
};

module.exports=new Server();
module.exports.Server=Server;
/*
module.exports.create = require( "./server").create;
module.exports.logger = require('./logging');
module.exports.redwire = require('redwire');
module.exports.ip = require('ip');
module.exports.redbird = require('redbird');
module.exports.finalhandler = require('finalhandler');
*/
function Server(){
  
}


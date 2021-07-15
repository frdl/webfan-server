

'use strict';

var prop = Object.defineProperty;

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
		      if(!isNaN(arg)){
				 var app = that.apps[arg];
					if('function'===typeof app.app.close){
					    app.app.close();	
					}else if('function'===typeof app.app.stop){
					    app.app.stop();	
					}else{
						throw new Error(`App ${arg}# - ${app.title} is not closable and not stopable!`);
					}
		      }else if('string'===typeof arg){
			     for(var i=0;i<that.apps.length;i++){
				 var app = that.apps[i];
				 if('undefined'!==typeof app.type){
				   var type = app.type.split(/[\#\s\/\.]/);
				   var query = arg.split(/\#/);	 
				   if((type[0] === query[0] || '*' === query[0])  && (type[1] === query[1] || '*' === query[1])  && ('undefined'===typeof query[2] || type[2] === query[2] || '*' === query[2] || '' === query[2])) ){
				  	that.close(i);
				   }
				 }
			     }
		      }
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


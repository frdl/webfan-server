

'use strict';

Server.prototype.consruct=()=>{
  

  var props = {};
  
    
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
		  return require( "./server").create;
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

function prop() {
  return Object.defineProperty(...arguments);
}	

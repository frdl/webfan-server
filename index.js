
/*
     "greenlock": "^2.4.2",
    "le-acme-core": "^2.1.3",
    "hubbie": "^4.2.0"
    */
'use strict';

Server.prototype.consruct=()=>{
  
  /*
   var logger = winston.createLogger({
    transports: [
      transport,
      new winston.transports.Syslog()
    ]
  });
  
  var redbird = new require('redbird')({
	port: 8080,

	// Specify filenames to default SSL certificates (in case SNI is not supported by the
	// user's browser)
	ssl: {
		port: 8443,
		key: "certs/dev-key.pem",
		cert: "certs/dev-cert.pem",
	}
});
 */
  var props = {};
  
    
  prop(this, 'proxy', {
  	get : ()=>{
      if('undefined'===typeof props.proxy){
        props.proxy =new require('redbird')({});
      }
		  return props.proxy;
	  },
    set : (conf)=>{      
	  	 props.proxy = new require('redbird')(conf);
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

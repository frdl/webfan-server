# webfan-server

Proxy, LoadBalancer, vHost Multiserver Application

## Installation
````
$ npm install @frdl/webfan-server
````

## Usage
Example server.js
````javascript
var path = require('path');
var Server = require("@frdl/webfan-server");

/*
var mountHandlers =Server.create(path.resolve(__dirname, 'webfan-server.config.js'));
*/
var WebfanServer = new Server(path.resolve(__dirname, 'webfan-server.config.js'));
WebfanServer.create();
````

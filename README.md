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
var WebfanServer = require("@frdl/webfan-server");
var mountHandlers = WebfanServer.create(path.resolve(__dirname, 'webfan-server.config.js'));
console.log(mountHandlers);
````

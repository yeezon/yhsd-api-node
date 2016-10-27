var appHost = 'apps.youhaosuda.com';
var apiHost = 'api.youhaosuda.com';
var http = require('https');
var httpProtocol = 'https';

process.argv.forEach(function (val,index) {
  if(val === '-apphost'){
    appHost = process.argv[index + 1];
  }
  if(val === '-apihost'){
    apiHost = process.argv[index + 1];
  }
  if(val === '-http'){
    http = require('http');
    httpProtocol = 'http';
  }
});


var config = {
  http: http,
  httpProtocol: httpProtocol,
  appHost: appHost,
  apiHost: apiHost,
  requestLimit: 40,
  requestStep: 510
};
module.exports = config;

var requestService = require('https');
var appHost = 'apps.youhaosuda.com';
var apiHost = 'api.youhaosuda.com';
var httpProtocol = 'https';

process.argv.forEach(function (val,index) {
  if(val === '-apphost'){
    appHost = process.argv[index + 1];
  }
  if(val === '-apihost'){
    apiHost = process.argv[index + 1];
  }
  if(val === '-http'){
    requestService = require('http');
    httpProtocol = 'http';
  }
  if(val === '-https'){
    requestService = require('https');
    httpProtocol = 'https';
  }
});


var config = {
  requestService: requestService,
  httpProtocol: httpProtocol,
  appHost: appHost,
  apiHost: apiHost,
  requestLimit: 40,
  requestTimeout: 510,
  readRequestCount: null,
  saveRequestCount: null
};
module.exports = config;

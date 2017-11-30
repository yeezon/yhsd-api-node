var request = require('request-promise');
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
    request = require('http');
    httpProtocol = 'http';
  }
  if(val === '-https'){
    request = require('https');
    httpProtocol = 'https';
  }
});


var config = {
  request: request,
  httpProtocol: httpProtocol,
  appHost: appHost,
  apiHost: apiHost,
  requestLimit: 40,
  requestTimeout: 510,
  readRequestCountFn: null,
  writeRequestCountFn: null
};
module.exports = config;

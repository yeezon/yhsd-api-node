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
    httpProtocol = 'http';
  }
  if(val === '-https'){
    httpProtocol = 'https';
  }
});


var config = {
  httpProtocol: httpProtocol,
  appHost: appHost,
  apiHost: apiHost,
  requestLimit: 100, // 每秒请求数限制
  requestTimeout: 100,  // 每个请求数释放所消耗的 ms
};
module.exports = config;

var Bluebird = require('bluebird');
var querystring = require('querystring');
var config = require('./config');
var reqCount = {};
var writeReqCountFn = config.writeRequestCountFn || function (token,count) {
  return new Bluebird(function (resolve) {
    reqCount[token] = count;
    resolve();
  })
};
var readReqCountFn = config.readRequestCountFn || function (token) {
  return new Bluebird(function (resolve) {
    resolve(reqCount[token]);
  })
};
/**
 * 释放1个请求
 * @param token
 */
var minusReqCountFn = function (token) {
  return readReqCountFn(token).then(function (count) {
    count -= 1;
    return writeReqCountFn(token, count);
  });
};
/**
 * 记录1个请求
 * @param token
 */
var plusReqCountFn = function (token) {
  return readReqCountFn(token).then(function (count) {
    count += 1;
    return writeReqCountFn(token, count);
  });
}


var request = function (options, params, callback) {
  if (typeof readReqCountFn !== 'function') {
    throw new Error('The readRequestCountFn parameters must be function')
  }
  if (typeof writeReqCountFn !== 'function') {
    throw new Error('The writeRequestCountFn parameters must be function')
  }
  
  var token = options.headers['X-API-ACCESS-TOKEN'];
  
  readReqCountFn(token)
    .then(function (reqCount) {
    if (typeof reqCount !== 'number'){
      // 初始化 token 的请求数
      reqCount = 0;
    }
    
    // 如果请求数等于限制,则排队
    if (reqCount == config.requestLimit) {
      setTimeout(request, config.requestTimeout, options, params, callback);
      throw undefined;
    }
  
    reqCount += 1;
    return writeReqCountFn(token, reqCount);
  }).then(function () {
    if (params) {
      var reqOption = {
        uri: options.hostname + options.path,
        method: options.method,
        headers: options.headers,
        resolveWithFullResponse: true
      };
      if (options.headers['Content-Type'] && options.headers['Content-Type'].toLowerCase() == 'application/x-www-form-urlencoded') {
        reqOption.from = params;
      }else {
        switch (options.method.toUpperCase()) {
          case 'POST':
          case 'PUT':
            reqOption.body = params;
            break;
        }
      }
    }
    return config.request(reqOption);
  }).then(function (res) {
    //结果
    callback(null,res.body);
    return res;
  }).finally(function (res) {
    var limitRate = eval(res.headers['x-yhsd-shop-api-call-limit']);
    // 算出 SaaS 记录的已使用的请求数
    var saasReqCount = config.requestLimit * limitRate;
    // 释放一个当前的请求
    var delayMs = saasReqCount * config.requestTimeout;
    return writeReqCountFn(token, saasReqCount).then(function () {
      setTimeout(minusReqCountFn, delayMs, token);
    });
  }).catch(function (err) {
    if(err !== undefined){
      callback(err);
    }
  });
  
};

module.exports = request;

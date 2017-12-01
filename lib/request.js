var querystring = require('querystring');
var config = require('./config');
var requestService = config.requestService;
var reqCountMap = {};
/**
 * 请求数的写入操作
 * @type {null|Function}
 */
var writeReqCountHandle = config.saveRequestCount || function (token, count, callback) {
  reqCountMap[token] = count;
  callback && callback();
};
/**
 * 请求数的读取操作
 * @type {null|Function}
 */
var readReqCountHandle = config.readRequestCount || function (token, callback) {
  callback && callback(null, reqCountMap[token]);
};
/**
 * 释放1个请求
 * @param token
 */
var minusReqCountFn = function (token, reqCount) {
  reqCount -= 1;
  writeReqCountHandle(token, reqCount);
};


/**
 * 请求操作
 * @param options
 * @param params
 * @param callback
 */
var requestAction = function (options, params, callback) {
  var token = options.headers['X-API-ACCESS-TOKEN'];
  if (typeof readReqCountHandle !== 'function') {
    throw new Error('The readRequestCount parameters must be function')
  }
  if (typeof writeReqCountHandle !== 'function') {
    throw new Error('The saveRequestCount parameters must be function')
  }
  
  readReqCountHandle(token, function (reqCount) {
    //初始化请求数
    if (typeof reqCount !== 'number') {
      reqCount = 0;
    }
    
    //如果请求数超过限制则 setTimeout 排队
    if (reqCount == config.requestLimit) {
      setTimeout(requestAction, config.requestTimeout, options, params, callback);
      return;
    }
    
    //保存请求数
    reqCount += 1;
    writeReqCountHandle(token, reqCount, function () {
      
      var req = requestService.request(options, function (res) {
        var buf = [];
        res.on('end', function () {
          var data = Buffer.concat(buf).toString();
          try {
            data = JSON.parse(data);
          } catch (err) {
            callback(err);
          } finally {
            //释放当前请求数
            var yhsdReqCount = config.requestLimit * eval(res.headers['x-yhsd-shop-api-call-limit']);
            var delayMs = yhsdReqCount * config.requestTimeout;
            setTimeout(minusReqCountFn, delayMs, token, reqCount);
          }
          //返回结果
          callback(null, data);
        });
        res.on('data', function (data) {
          buf.push(data);
        });
        
      });
      
      req.on('error', function (err) {
        //request error event
        callback(err);
      });
      
      // 发送参数
      if (params) {
        var stringify;
        if (options.headers['Content-Type'] && options.headers['Content-Type'].toLowerCase() == 'application/x-www-form-urlencoded') {
          stringify = querystring.stringify;
        } else {
          switch (options.method.toUpperCase()) {
            case 'POST':
            case 'PUT':
              stringify = JSON.stringify;
              break;
          }
        }
        req.write(stringify(params));
      }
      
      req.end();
    })
  });
};



module.exports = requestAction;

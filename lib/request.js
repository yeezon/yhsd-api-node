var querystring = require('querystring');
var config = require('./config');
var requestService = config.requestService;
var reqCountMap = {};
/**
 * 请求数的保存操作
 * @type {null|Function}
 */
var saveReqCountHandle = config.saveRequestCount || function (token, count, callback) {
  reqCountMap[token] = count;
  callback && callback(null);
};
/**
 * 请求数的读取操作
 * callback 接受一个
 * @type {null|Function}
 */
var getReqCountHandle = config.getRequestCount || function (token, callback) {
  callback && callback(null, reqCountMap[token]);
};
/**
 * 释放1个请求
 * @param token
 * @param reqCount
 */
var reduceReqCountFn = function (token, reqCount) {
  reqCount -= 1;
  saveReqCountHandle(token, reqCount);
};


/**
 * 请求操作
 * @param options
 * @param params
 * @param callback
 */
var requestAction = function (options, params, callback) {
  var token = options.headers['X-API-ACCESS-TOKEN'];
  if (typeof getReqCountHandle !== 'function') {
    throw new Error('The readRequestCount parameters must be function')
  }
  if (typeof saveReqCountHandle !== 'function') {
    throw new Error('The saveRequestCount parameters must be function')
  }
  
  getReqCountHandle(token, function (e1, reqCount) {
    if (e1) {
      console.error(e1);
      throw e1;
    }
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
    saveReqCountHandle(token, reqCount, function (e2) {
      if (e2) {
        console.error(e2);
        throw e2;
      }
      
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
            setTimeout(reduceReqCountFn, delayMs, token, reqCount);
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

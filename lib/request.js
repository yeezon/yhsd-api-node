var Promise = require('bluebird').noConflict();
var querystring = require('querystring');
var config = require('./config');
var requestService = config.requestService;
var minuend = 1; //每次漏出的数量
var reqCountMap = {};
/**
 * 请求数的读取操作
 * @param token 商店 token
 * @type {null|Function}
 */
var getReqCountHandle = function (token) {
  return Promise.resolve(function () {
    return reqCountMap[token];
  });
};
/**
 * 请求数的保存操作
 * @param token 商店 token
 * @param reqCount 需要保存的请求数
 * @type {null|Function}
 */
var saveReqCountHandle = function (token, reqCount) {
  return Promise.resolve(function () {
    reqCountMap[token] = reqCount;
    return reqCount;
  });
};
/**
 * 释放1个请求
 * @param token
 */
var reduceReqCountFn = function (token) {
  return getReqCountHandle(token)
    .then(function (reqCount) {
      if (reqCount <= minuend) {
        reqCount = 0;
      } else {
        reqCount -= minuend;
      }
      return reqCount;
    })
    .then(function (reqCount) {
      return saveReqCountHandle(token, reqCount)
        .then(function () {
          return reqCount;
        });
    });
};

/**
 * 请求方法
 * @param opt
 */
var request = function (opt) {
  var params = opt.params;
  var options = opt.options;
  var token = opt.token;
  return Promise(function (resolve, reject) {
    const req = requestService.request(options, function (res) {
      var buf = [];
      res.on('end', function () {
        var data = Buffer.concat(buf).toString();
        try {
          data = JSON.parse(data);
        } catch (err) {
          reject(err);
        } finally {
          //释放当前请求数
          var yhsdReqCount = +(config.requestLimit * (eval(res.headers['x-yhsd-shop-api-call-limit']) + 1e-6)).toFixed(0);
          var delayMs = yhsdReqCount * config.requestTimeout;
          saveReqCountHandle(token, yhsdReqCount);
          setTimeout(reduceReqCountFn, delayMs, token);
        }
        //返回结果
        resolve(null, data);
      });

      res.on('data', function (data) {
        buf.push(data);
      });
    });

    req.on('error', function (err) {
      //request error event
      reject(err);
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
  });
};


/**
 * 请求操作
 * @param options
 * @param params
 * @param callback
 */
var requestAction = function (options, params, callback) {
  var token = options.headers['X-API-ACCESS-TOKEN'];
  
  if (!!config.getRequestCount) {
    if (typeof config.getRequestCount !== 'function') {
      throw new Error('The getRequestCount parameters must be function');
    }
    getReqCountHandle = config.getRequestCount;
  }
  
  if (!!config.saveRequestCount) {
    if (typeof config.saveRequestCount !== 'function') {
      throw new Error('The saveRequestCount parameters must be function');
    }
    saveReqCountHandle = config.saveRequestCount;
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
    if (reqCount >= config.requestLimit) {
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
            var yhsdReqCount = +(config.requestLimit * (eval(res.headers['x-yhsd-shop-api-call-limit']) + 1e-6)).toFixed(0);
            var delayMs = yhsdReqCount * config.requestTimeout;
            saveReqCountHandle(token, yhsdReqCount, function () {
              setTimeout(reduceReqCountFn, delayMs, token);
            });
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
    });
  });
};


module.exports = requestAction;

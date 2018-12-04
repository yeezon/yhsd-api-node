var Promise = require('bluebird');
var querystring = require('querystring');
var config = require('./config');

var client = config.requestService;
var MINUEND = 1; //每次漏出的数量
var API_CALL_LIMIT = 'x-yhsd-shop-api-call-limit'; // yhsd 接口返回的请求量 header


/**
 * stringify 参数
 * @param options
 * @returns {*}
 */
function genStringify(options) {
  var stringifyFn;
  if (options.headers['Content-Type'] &&
    options.headers['Content-Type'].toLowerCase() === 'application/x-www-form-urlencoded') {
    stringifyFn = querystring.stringify;
  } else {
    switch (options.method.toUpperCase()) {
      case 'POST':
      case 'PUT':
        stringifyFn = JSON.stringify;
        break;
    }
  }
  return stringifyFn;
}

/**
 * 增加1个请求
 * @param count
 * @returns {*}
 */
function increment(count) {
  //保存请求数
  count += 1;
  return count;
}

/**
 * 释放1个请求
 */
function decrement(count) {
  if (count <= MINUEND) {
    count = 0;
  } else {
    count -= MINUEND;
  }
  return count;
}


var Request = function (option) {
  this.getRequestCount = option && option.getRequestCount;
  this.saveRequestCount = option && option.saveRequestCount;
  this.counted = this.getRequestCount && this.saveRequestCount;
};

Request.prototype = {
  /**
   * 请求操作
   * @param options
   * @param params
   */
  request: function (options, params) {
    var self = this;
    return this.onBeforeHandle()
      .then(function () {

        // 请求 Promise
        return new Promise(function (resolve, reject) {
          const req = client.request(options, self.genResponseFn(resolve, reject));

          req.on('error', reject);

          // 发送参数
          if (params) {
            var stringify = genStringify(options);
            req.write(stringify(params));
          }

          req.end();
        });
      });
  },
  /**
   * response 操作
   * @param resolve
   * @param reject
   * @returns {Function}
   */
  genResponseFn: function (resolve, reject) {
    var self = this;

    return function (res) {
      var buf = [];

      res.on('end', function () {
        var data = Buffer.concat(buf).toString();
        try {
          data = JSON.parse(data);
        } catch (err) {
          reject(err);
        } finally {
          //释放当前请求数
          var count = +(config.requestLimit * (eval(res.headers[API_CALL_LIMIT]) + 1e-6)).toFixed(0);
          self.onAfterHandle(count);
          //返回结果
        }
        resolve(data);
      });

      res.on('data', function (data) {
        buf.push(data);
      });
    };
  },
  /**
   * 请求前的操作
   */
  onBeforeHandle: function () {
    var self = this;

    if (this.counted) {
      return this.getRequestCount()
        .then(function (count) {
          //如果请求数超过限制则 setTimeout 排队
          if (count >= config.requestLimit) {
            return Promise.delay(config.requestTimeout).then(self.onBeforeHandle);
          }
          return count;
        })
        .then(increment)
        .then(this.saveRequestCount);
    }

    return Promise.resolve();
  },
  /**
   * 请求后的操作
   * @param count
   */
  onAfterHandle: function (count) {
    var delayMs = count * config.requestTimeout;

    if (this.counted) {
      if (this.getRequestCount && this.saveRequestCount)
        return this.saveRequestCount(count)
          .delay(delayMs)
          .then(this.getRequestCount)
          .then(decrement)
          .then(this.saveRequestCount);
    }

    return Promise.resolve();
  }
};


module.exports = Request;

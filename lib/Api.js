var querystring = require('querystring');
var Promise = require('bluebird');

var util = require('./util');
var config = require('./config');
var Request = require('./Request');

var reqCountMap = {};
paramError = new Error('缺少参数');
promiseError = new Error('`getRequestCount`和`saveRequestCount`必须是 function');

function check(option) {
  if (option &&
    (option.getRequestCount || option.saveRequestCount) &&
    (!util.isFunction(option.getRequestCount) || !util.isFunction(option.saveRequestCount))) {
    throw promiseError;
  }
}

/**
 * 请求数的读取操作
 * @param token 商店 token
 * @type {null|Function}
 */
var getReqCountHandle = function (token) {
  return reqCountMap[token];
};

/**
 * 请求数的保存操作
 * @param token 商店 token
 * @param count 需要保存的请求数
 * @type {null|Function}
 */
var saveReqCountHandle = function (token, count) {
  reqCountMap[token] = count;
  return reqCountMap[token];
};

var reqCountWrap = function (token, fn) {
  return function () {
    arguments.unshift(token);
    fn.call(this, arguments);
  };
};

/**
 * 初始化
 * @param {string} token
 * @param option
 * @constructor
 */
var Api = function (token, option) {
  if (arguments.length < 1) {
    throw paramError;
  }
  check(option);

  if (!option) {
    option = {
      getRequestCount: getReqCountHandle,
      saveRequestCount: saveReqCountHandle,
    };
  }
  var getReqCountWrap = reqCountWrap(this.token, option.getRequestCount);
  var saveReqCountWrap = reqCountWrap(this.token, option.saveRequestCount);

  this.token = token;
  this._request = new Request({
    getRequestCount: Promise.cast(getReqCountWrap),
    saveRequestCount: Promise.cast(saveReqCountWrap),
  });
};

Api.prototype = {
  /**
   * 发送 GET 请求
   * @param {string} path
   * @param {Object} [query]
   */
  get: function (path, query) {
    if (arguments.length < 1) {
      throw paramError;
    }
    return this.request('GET', query ? path + '?' + querystring.stringify(query) : path, null);
  },
  /**
   * 发送 PUT 请求
   * @param {string} path
   * @param {Object} data
   */
  put: function (path, data) {
    if (arguments.length < 2) {
      throw paramError;
    }
    return this.request('PUT', path, data);
  },
  /**
   * 发送 POST 请求
   * @param {string} path
   * @param {Object} data
   */
  post: function (path, data) {
    if (arguments.length < 2) {
      throw paramError;
    }
    return this.request('POST', path, data);
  },
  /**
   * 发送 DELETE 请求
   * @param {string} path
   * @param {Function} callback
   */
  delete: function (path) {
    if (arguments.length < 1) {
      throw paramError;
    }
    return this.request('DELETE', path, null);
  },
  /**
   * @param {string} method
   * @param {string} path
   * @param {Object} [params]
   * @param {Function} callback
   */
  request: function (method, path, params) {
    return this._request.request({
      hostname: config.apiHost,
      path: '/v1/' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-ACCESS-TOKEN': this.token
      }
    }, params);
  }
};

module.exports = Api;

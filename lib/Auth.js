var querystring = require('querystring');
var crypto = require('crypto');
var config = require('./config');
var Request = require('./Request');
var YhsdError = require('./Error').YhsdError;
var YhsdParamError = require('./Error').YhsdParamError;
var timeOffset = 1000 * 60 * 10;

/**
 * 构造函数
 * @param {Object} options
 * @param {string} options.appKey 应用的appKey
 * @param {string} options.appSecret 应用的appSecret
 * @param {string} options.callbackUrl 用于开放应用，应用管理后台设置的回调地址
 * @param {string} options.redirectUrl 用于开放应用，可选，自定义回调地址，默认同 callbackUrl
 * @param {Array} options.scope 用scope 于开放应用，可选，权限范围，默认为 ['read_basic']
 * @param {Boolean} options.private  可选，是否为私有应用，默认为 false
 * @param {string} options.protocol 可选，'http'或者'https',默认'https'
 * @param {string} options.host 可选，开发 API 接口域名,默认'api.youhaosuda.com'
 * @constructor
 */
var Auth = function (options) {
  if (arguments.length < 1 || !options.appKey || !options.appSecret) {
    throw new YhsdParamError(['options.appKey', 'options.appSecret']);
  }
  if (!options.private) {
    if (!options.callbackUrl) {
      throw new YhsdParamError(['options.callbackUrl']);
    }
    options.scope || (options.scope = ['read_basic']);
  }

  this.app_key = options.appKey || '';
  this.app_secret = options.appSecret || '';
  this.private = options.private || false;
  this.callback_url = options.callbackUrl || '';
  this.scope = options.scope || '';
  this.redirect_url = options.redirectUrl || '';
  this.protocol = options.protocol || config.httpProtocol;
  this.host = options.host || config.appHost;
  this._request = new Request({
    protocol: this.protocol,
  });
};

Auth.prototype = {
  /**
   * 验证 Hmac
   * @param {Object} queryObj 回调地址的参数对象
   * @return {boolean}
   */
  verifyHmac: function (queryObj) {
    if (arguments.length < 1) {
      throw new YhsdParamError(['query.hmac', 'query.time_stamp']);
    }
    var hmac = queryObj.hmac;
    delete queryObj.hmac;
    return (Date.now() - new Date(queryObj.time_stamp).getTime() < timeOffset) &&
      (hmac === crypto.createHmac('sha256', this.app_secret)
        .update(decodeURIComponent(querystring.stringify(queryObj)), 'utf8')
        .digest('hex'));
  },
  /**
   * 获取应用授权页面地址，用于开放应用
   * @param {string} shopKey
   * @param {string} state
   * @return {string}
   */
  getAuthorizeUrl: function (shopKey, state) {
    if (arguments.length < 1) {
      throw new YhsdParamError(['shopKey', 'state']);
    }
    return this.protocol + '://' + this.host + '/oauth2/authorize?' + querystring.stringify({
      response_type: 'code',
      client_id: this.app_key,
      shop_key: shopKey,
      scope: this.scope.join(','),
      state: state,
      redirect_uri: this.redirect_url
    }, null, null, { encodeURIComponent: null });
  },
  /**
   * 获取 token
   * @param {string} code，用于开放应用
   * @returns {Object<Promise>}
   */
  getToken: function (code) {
    var params;
    var headers = { 'Content-Type': 'application/x-www-form-urlencoded' };


    if (this.private) {
      headers.Authorization = 'Basic ' +  Buffer.from(this.app_key + ':' + this.app_secret).toString('base64');
      params = {
        grant_type: 'client_credentials'
      };
    } else {
      if (arguments.length < 1) {
        throw new YhsdParamError(['code']);
      }
      params = {
        grant_type: 'authorization_code',
        code: code,
        client_id: this.app_key,
        redirect_uri: this.redirect_url ? this.redirect_url : this.callback_url
      };
    }

    var option = {
      hostname: this.host,
      path: '/oauth2/token',
      method: 'POST',
      headers: headers
    };
    return this._request.request(option, params).then(function (data) {
      if (!data || !data.token) {
        switch ((data || {}).error) {
          case 'invalid_grant':
            throw new YhsdError('未授权, 请检查 appKey, appSecret!');   
          case 'invalid_client':
            throw new YhsdError('无效客户端, 请检查 appKey, appSecret!');
          default:
            throw new YhsdError('获取 token 失败!');
        }
      }
      return data.token;
    });
  },
  customerData: function (secret_key, customer_data) {
    var customer_str = JSON.stringify(customer_data);
    var cipher = crypto.createCipher('aes-256-cbc', secret_key);
    var crypted = cipher.update(customer_str, 'utf8', 'hex');
    return cipher.final('hex');
  }
};


module.exports = Auth;

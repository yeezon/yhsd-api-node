# yhsd-api-node

友好速搭 API SDK for Node(>= v6) 
支持`Promise`依赖[bluebird](https://github.com/petkaantonov/bluebird)。


[![Build status](https://img.shields.io/travis/yeezon/yhsd-api-node.svg?style=flat-square)](https://travis-ci.org/yeezon/yhsd-api-node)
[![Coverage Status](https://img.shields.io/coveralls/yeezon/yhsd-api-node.svg?style=flat-square)](https://coveralls.io/repos/yeezon/yhsd-api-node)
[![Dependency Status](https://img.shields.io/david/yeezon/yhsd-api-node.svg?style=flat-square)](https://david-dm.org/yeezon/yhsd-api-node)


## 安装

```bash
$ npm install --save yhsd-api
```

## 授权

```javascript
var Yhsd = require('yhsd-api');

/**
 * 初始化
 * @param {object} options
 * @param {string} options.appKey 应用的appKey
 * @param {string} options.appSecret 应用的appSecret
 * @param {string} options.callbackUrl 用于开放应用，应用管理后台设置的回调地址
 * @param {string} options.redirectUrl 用于开放应用，可选，自定义回调地址，默认同 callbackUrl
 * @param {Array} options.scope 用于开放应用，可选，权限范围，默认为 ['read_basic']
 * @param {Boolean} options.private 可选，是否为私有应用，默认为 false
 * @param {string} options.protocol 可选，'http'或者'https',默认'https'
 * @param {string} options.host 可选，授权接口域名,默认'apps.youhaosuda.com'
 * @constructor
 */
var auth = new Yhsd.Auth(options);

/**
 * 验证 Hmac
 * @param {object} queryObj 回调地址的参数对象
 * @return {boolean}
 */
auth.verifyHmac(queryObj);

/**
 * 获取应用授权页面地址，用于开放应用
 * @param {string} shopKey
 * @param {string} [state]
 * @return {string}
 */
auth.getAuthorizeUrl(shopKey, state);

/**
 * 获取 token
 * @param {string} [code]，用于开放应用
 * @returns {Object<Promise>}
 */
auth.getToken(code);
```

详见
https://docs.youhaosuda.com/app/s/553e33880abc3e6f3e000026

### 例子

```javascript
var Yhsd = require('yhsd-api');
var auth = new Yhsd.Auth({
    appKey: '8fce436b6fe74d5c8e2317**********',
    appSecret: '3c91e9bd912145de953e0d**********',
    private: true
});
auth.getToken().then(function (token) {
    console.log(token);
});
```

## 使用 API

```javascript
var Yhsd = require('yhsd-api');

/**
 * 初始化
 * @param {string} token
 * @param {object} option
 * @param {string} option.protocol 可选，'http'或者'https',默认'https'
 * @param {string} option.host 可选，开发 API 接口域名,默认'api.youhaosuda.com'
 * @param {function} option.getRequestCount 获取请求数函数
 * @param {function} option.saveRequestCount 存储请求数函数
 * @constructor
 */
var api = new Yhsd.Api(token);

/**
 * 发送 GET 请求
 * @param {string} path
 * @param {object} [query]
 * @returns {Object<Promise>}
 */
api.get(path, query);

/**
 * 发送 PUT 请求
 * @param {string} path
 * @param {object} data
 * @returns {Object<Promise>}
 */
api.put(path, data);

/**
 * 发送 POST 请求
 * @param {string} path
 * @param {object} data
 * @returns {Object<Promise>}
 */
api.post(path, data);

/**
 * 发送 DELETE 请求
 * @param {string} path
 * @returns {Object<Promise>}
 */
api.delete(path);
```

详见
https://docs.youhaosuda.com/app/553e335f0abc3e6f3e000023

### 例子

```javascript
var Yhsd = require('yhsd-api');
var reqCountMap = {};
var api = new Yhsd.Api('2be799bf87144c2fbb881a**********',{
  getRequestCount: function (token){
    return reqCountMap[token];
  },
  saveRequestCount: function (token, count){
    reqCountMap[token] = count;
    return count;
  }
});
// 获取顾客列表
api.get('customers', { fields: 'id,name' }).then(function (data) {
	console.log(data);
});
// 获取指定顾客
api.get('customers/100').then(function (data) {
    console.log(data);
});
```
## WebHook

```javascript
var Yhsd = require('yhsd-api');

/**
 * 初始化
 * @param {string} webHookToken
 * @constructor
 */
var webHook = new Yhsd.WebHook(webHookToken);

/**
 * 验证 Hmac
 * @param {string} hmac
 * @param {string} bodyData 响应体数据
 * @return {boolean}
 */
webHook.verifyHmac(hmac, bodyData);
```

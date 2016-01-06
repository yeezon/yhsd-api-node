# yhsd-api-node

友好速搭 API SDK for Node

[![Build status](https://img.shields.io/travis/Obzer/yhsd-api-node.svg?style=flat-square)](https://travis-ci.org/Obzer/yhsd-api-node)
[![Coverage Status](https://img.shields.io/coveralls/Obzer/yhsd-api-node.svg?style=flat-square)](https://coveralls.io/repos/Obzer/yhsd-api-node)
[![Dependency Status](https://img.shields.io/david/Obzer/yhsd-api-node.svg?style=flat-square)](https://david-dm.org/Obzer/yhsd-api-node)

## 安装

```bash
$ npm install --save yhsd-api
```

## 授权

```javascript
var Yhsd = require('yhsd-api');

/**
 * 初始化
 * @param {Object} options
 * @constructor
 *
 * options 可选值：
 * appKey {string} 应用的appKey
 * appSecret {string} 应用的appSecret
 * callbackUrl {string} 用于开放应用，应用管理后台设置的回调地址
 * redirectUrl {string} 用于开放应用，可选，自定义回调地址，默认同 callbackUrl
 * scope {Array} 用于开放应用，可选，权限范围，默认为 ['read_basic']
 * private {boolean} 可选，是否为私有应用，默认为 false
 */
var auth = new Yhsd.Auth(options);

/**
 * 验证 Hmac
 * @param {Object} queryObj 回调地址的参数对象
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
 * @param {Function} callback(err, token)
 */
auth.getToken(code, callback);
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
auth.getToken(function(err, token) {
	console.log(token);
});
```

## 使用 API

```javascript
var Yhsd = require('yhsd-api');

/**
 * 初始化
 * @param {string} token
 * @constructor
 */
var api = new Yhsd.Api(token);

/**
 * 发送 GET 请求
 * @param {string} path
 * @param {Object} [query]
 * @param {Function} callback(err, data)
 */
api.get(path, query, callback);

/**
 * 发送 PUT 请求
 * @param {string} path
 * @param {Object} data
 * @param {Function} callback
 */
api.put(path, data, callback);

/**
 * 发送 POST 请求
 * @param {string} path
 * @param {Object} data
 * @param {Function} callback
 */
api.post(path, data, callback);

/**
 * 发送 DELETE 请求
 * @param {string} path
 * @param {Function} callback
 */
api.delete(path, callback);
```

详见
https://docs.youhaosuda.com/app/553e335f0abc3e6f3e000023

### 例子

```javascript
var Yhsd = require('yhsd-api');
var api = new Yhsd.Api('2be799bf87144c2fbb881a**********');
// 获取顾客列表
api.get('customers', { fields: 'id,name' }, function(err, data) {
	console.log(data);
});
// 获取指定顾客
api.get('customers/100', function(err, data) {
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

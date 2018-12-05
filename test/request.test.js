/**
 * Created by obzerg on 16/1/5.
 */
var Promise = require('bluebird');
var should = require('should');

var Request = require('../lib/Request');
var Yhsd = require('../index');
var reqCountMap = {};
var token = '5e242b4b41d14a2d8f4d80a9c6b05bea';

describe('test/request.test.js', function () {
  describe('auth request', function () {
    var _request = new Request();
    it('should return token', function (done) {
      console.time('complete');
      _request.request({
        hostname: Yhsd.config.appHost,
        path: '/oauth2/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic NGQwYzZkMmMxMjQ1NDI4NGJjYzVjNDViMTQyODZkOTM6ZWQ5NDY5NDI2MGEwNGZmY2EwMTVhNzVmM2Q4MmUzMDA=',
        }
      }, {
        grant_type: 'client_credentials',
      }).then(function (data) {
        console.timeEnd('complete');
        console.log('token', data);
        should.ok(data);
        token = data;
        done();
      });
    });
  });

  describe('api request', function () {
    var _request = new Request({
      getRequestCount: function () {
        return Promise.resolve(reqCountMap[token] || 0);
      },
      saveRequestCount: function (count) {
        reqCountMap[token] = count;
        return Promise.resolve(count);
      },
    });
    it('should return ok', function (done) {
      var i = 0;

      function request() {
        console.time('complete');
        _request.request({
          hostname: Yhsd.config.apiHost,
          path: '/v1/shop',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-ACCESS-TOKEN': token
          }
        })
          .then(function () {
            console.timeEnd('complete');
            console.log(reqCountMap[token], i);
          })
          .then(function () {
            if (i < 200) {
              request();
              return;
            }
            done();
          });
        i++;
      }

      request();
    });
  });
});

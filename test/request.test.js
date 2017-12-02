/**
 * Created by obzerg on 16/1/5.
 */
var should = require('should');
var https = require('https');
var Yhsd = require('../index');
var reqCountMap = {};
var testToken = 'fbc7f83524f14e358a325a5066acd741';

describe('test/request.test.js', function () {
  for (let i = 0; i < 200; i++) {
    it(`should return request count by the token ${i}`, function (done) {
      this.timeout(1 * 1000);
      console.time('whole');
      console.time('first');
      console.time('save time');
      console.time('get time');
      Yhsd.config.saveRequestCount = function (token, reqCount, callback) {
        console.timeEnd('save time');
        console.log('save',typeof reqCount,reqCount);
        console.time('save time');
        reqCountMap[token] = reqCount;
        callback && callback(null);
      }
      Yhsd.config.getRequestCount = function (token, callback) {
        console.timeEnd('get time');
        console.log('get',typeof reqCountMap[token],reqCountMap[token]);
        console.time('get time');
        callback && callback(null, reqCountMap[token]);
      }
    
      
      
      var api = new Yhsd.Api(testToken);
      api.get('shop', function (err, body) {
        if (err) {
          console.log(err);
          // done(err);
          // return;
        }
        console.timeEnd('first');
        console.log('first request count', reqCountMap[testToken]);
        
        var req = https.request({
          hostname: Yhsd.config.apiHost,
          path: '/v1/shop',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-ACCESS-TOKEN': testToken
          }
        }, function (res) {
          console.timeEnd('whole');
          console.log('last request count', reqCountMap[testToken]);
          console.log('limit', res.headers['x-yhsd-shop-api-call-limit']);
          var yhsdReqCount = +(Yhsd.config.requestLimit * (eval(res.headers['x-yhsd-shop-api-call-limit']) + 1e-6)).toFixed(0);
          should.ok((reqCountMap[testToken] + 1) === yhsdReqCount);
          done();
        });
      
        req.end();
      });
    });
  }
});

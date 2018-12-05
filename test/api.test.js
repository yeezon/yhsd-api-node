/**
 * Created by obzerg on 16/1/5.
 */
var should = require('should');
var Yhsd = require('../index');

describe('test/api.test.js', function () {
  var api;
  before(function () {
    api = new Yhsd.Api('5e242b4b41d14a2d8f4d80a9c6b05bea');
  });

  it('get api instance should throw error', function () {
    (function () {
      new Yhsd.Api();
    }).should.throw('缺少参数');
  });

  it('http get should be throw error', function () {
    (function () {
      api.get();
    }).should.throw('缺少参数');
  });

  it('http get should be success', function (done) {
    api.get('products', { fields: 'id' }).then(function (body) {
      should.exist(body);
      done();
      //13576
    });
  });

  it('http put should be throw error', function () {
    (function () {
      api.put();
    }).should.throw('缺少参数');
  });

  it('http put should be success', function (done) {
    api.put('themes/13576', { "theme": { "name": "测试主题" } }).then(function (body) {
      should.exist(body);
      done();
      //13576
    });
  });

  it('http post should be throw error', function () {
    (function () {
      api.post();
    }).should.throw('缺少参数');
  });

  it('http post should be success', function (done) {
    var obj = {
      meta: {
        name: new Date().getTime() + '',
        owner_id: '0',
        owner_resource: 'shop',
        fields: { 'test': 'test' },
        descriptions: 'test'
      }
    };
    api.post('metas', obj).then(function (body) {
      should.exist(body);
      var id = body.meta.id;
      api.delete('metas/' + id).then(function (body) {
        should.exist(body);
        done();
      });
    });
  });

  it('http delete should be throw error', function () {
    (function () {
      api.delete();
    }).should.throw('缺少参数');
  });

  it('http delete should be success', function (done) {
    var obj = {
      meta: {
        name: new Date().getTime() + '',
        owner_id: '0',
        owner_resource: 'shop',
        fields: { 'test': 'test' },
        descriptions: 'test'
      }
    };
    api.post('metas', obj).then(function (body) {
      should.exist(body);
      var id = body.meta.id;
      api.delete('metas/' + id).then(function (body) {
        should.exist(body);
        done();
      });
    });
  });

  it('api should be return error code 404', function (done) {
    api.get('12345').then(function (body) {
      body.code.should.equal(404);
      done();
    });
  });

  it('api should be throw ENOTFOUND error', function (done) {
    Yhsd.config.apiHost = 'localhost:32876';
    Yhsd.config.appHost = 'localhost:32876';
    Yhsd.config.httpProtocol = 'http';
    api.get('products').then(function (body) {
      console.log(body);
      should.not.exist(body);
      done(new Error('没有捕捉到错误!'));
    }).catch(function (err) {
      // console.log(err.message);
      var eResult = err.message.indexOf('ENOTFOUND');
      if (eResult > 0) {
        (eResult).should.be.ok();
        done();
        return;
      }
    });
  });
});


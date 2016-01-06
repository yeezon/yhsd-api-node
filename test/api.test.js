/**
 * Created by obzerg on 16/1/5.
 */
var should = require('should');
var Yhsd = require('../index');

describe('test/api.test.js', function () {
    var api;
    before(function () {
        api = new Yhsd.Api('fbc7f83524f14e358a325a5066acd741');
    });

    it('get api instance should throw error', function () {
        (function () {
            new Yhsd.Api()
        }).should.throw('缺少参数');
    });

    it('http get should be throw error', function () {
        (function () {
            api.get()
        }).should.throw('缺少参数');
    });

    it('http get should be success', function (done) {
        api.get('products', {fields: 'id'}, function (err, body) {
            should.not.exist(err);
            should.exist(body);
            done();
            //13576
        })
    });

    it('http put should be throw error', function () {
        (function () {
            api.put()
        }).should.throw('缺少参数');
    });

    it('http put should be success', function (done) {
        api.put('themes/13576', {"theme": {"name": "测试主题"}}, function (err, body) {
            should.not.exist(err);
            should.exist(body);
            done();
            //13576
        })
    });

    it('http post should be throw error', function () {
        (function () {
            api.post()
        }).should.throw('缺少参数');
    });

    it('http post should be success', function (done) {
        var obj = {
            meta: {
                name: new Date().getTime() + '',
                owner_id: '0',
                owner_resource: 'shop',
                fields: {'test': 'test'},
                descriptions: 'test'
            }
        };
        api.post('metas', obj, function (err, body) {
            should.not.exist(err);
            should.exist(body);
            var id = body.meta.id;
            api.delete('metas/' + id, function (err) {
                should.not.exist(err);
                done();
            })
        })
    });

    it('http delete should be throw error', function () {
        (function () {
            api.delete()
        }).should.throw('缺少参数');
    });

    it('http delete should be success', function (done) {
        var obj = {
            meta: {
                name: new Date().getTime() + '',
                owner_id: '0',
                owner_resource: 'shop',
                fields: {'test': 'test'},
                descriptions: 'test'
            }
        };
        api.post('metas', obj, function (err, body) {
            should.not.exist(err);
            should.exist(body);
            var id = body.meta.id;
            api.delete('metas/' + id, function (err) {
                should.not.exist(err);
                done();
            })
        })
    });

    it('api should be return error code 404', function (done) {
        api.get('12345', function (err, body) {
            err.code.should.equal(404);
            done();
        })
    });

    it('api should be return error code 429', function (done) {
        var total = 0;
        function _request() {
            var index = 0;
            api.get('shop', function (err, body) {
                ++index;
                if(index == 3) round()
            });
            api.get('shop', function (err, body) {
                ++index;
                if(index == 3) round()

            });
            api.get('shop', function (err, body) {
                ++index;
                if(index == 3) round()
            });
        }
        function round(){
            total++;
            if(total < 20){
                console.log(total);
                setTimeout(_request,1000);
            } else {
                done();
            }
        }
        _request();
    });
});


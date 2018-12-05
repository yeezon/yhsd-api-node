/**
 * Created by obzerg on 16/1/5.
 */
var should = require('should');
var Yhsd = require('../index');
var crypto = require('crypto');
var querystring = require('querystring');

describe('test/auth.test.js', function () {
    it('get auth instance should be fail', function () {
        (function () {
            new Yhsd.Auth({
                appKey: '548e29e46091449e949a8e1ffe4e4167'
            })
        }).should.throw('缺少参数');
        //appKey和appSecret缺一不可
    });

    it('get public auth instance should be fail', function () {
        (function () {
            new Yhsd.Auth({
                appKey: '548e29e46091449e949a8e1ffe4e4167',
                appSecret: 'b9fec3d128064ea89f1e9b8324eeabc5'
            })
        }).should.throw('缺少参数');
        //缺少callbackUrl
    });

    it('get public token should throw error', function () {
        (function () {
            new Yhsd.Auth({
                appKey: '548e29e46091449e949a8e1ffe4e4167',
                appSecret: 'b9fec3d128064ea89f1e9b8324eeabc5',
                callbackUrl: 'http://your.app.url'
            }).getToken()
        }).should.throw('缺少参数');
        //缺少参数
    });

    it('private get token should be success', function (done) {
        var auth = new Yhsd.Auth({
            appKey: '548e29e46091449e949a8e1ffe4e4167',
            appSecret: 'b9fec3d128064ea89f1e9b8324eeabc5',
            private: true
        });
        auth.getToken().then(function (token) {
            token.should.equal('fbc7f83524f14e358a325a5066acd741');
            done();
        });
        //获取私有应用token
    });

    it('private get token should be fail', function (done) {
        var auth = new Yhsd.Auth({
            appKey: '548e29e46091449e949a8e1ffe4e4167',
            appSecret: 'b9fec3d128064ea89f1e9b8324eeabc5' + 'error',
            private: true
        });
        auth.getToken().catch(function (err) {
            should.exist(err);
            done();
        });
        //获取私有应用token
    });

    it('public get token should be fail', function (done) {
        var auth = new Yhsd.Auth({
            appKey: '548e29e46091449e949a8e1ffe4e4167',
            appSecret: 'b9fec3d128064ea89f1e9b8324eeabc5' + 'error',
            callbackUrl: 'http://your.app.url'
        });
        auth.getToken('your code').catch(function (err) {
            should.exist(err);
            done();
        });
        //获取公有应用token应传入code
    });

    it('getAuthorizeUrl should throw error', function () {
        (function () {
            new Yhsd.Auth({
                appKey: '548e29e46091449e949a8e1ffe4e4167',
                appSecret: 'b9fec3d128064ea89f1e9b8324eeabc5' + 'error',
                callbackUrl: 'http://your.app.url'
            }).getAuthorizeUrl()
        }).should.throw('缺少参数');
        //获取授权地址应传入appKey和参数中的state
    });


    it('getAuthorizeUrl', function () {
        var auth = new Yhsd.Auth({
            appKey: '548e29e46091449e949a8e1ffe4e4167',
            appSecret: 'b9fec3d128064ea89f1e9b8324eeabc5' + 'error',
            callbackUrl: 'http://your.app.url'
        });
        var url = 'https://apps.youhaosuda.com/oauth2/authorize?response_type=code&client_id=548e29e46091449e949a8e1ffe4e4167&shop_key=548e29e46091449e949a8e1ffe4e4167&scope=read_basic&state=123&redirect_uri=';
        auth.getAuthorizeUrl('548e29e46091449e949a8e1ffe4e4167', '123').should.equal(url);
        //获取授权地址应传入appKey和参数中的state,此处的state(123)为测试用,请勿直接使用
    });


    it('verifyHmac should throw error', function () {
        (function () {
            new Yhsd.Auth({
                appKey: '548e29e46091449e949a8e1ffe4e4167',
                appSecret: 'b9fec3d128064ea89f1e9b8324eeabc5' + 'error',
                callbackUrl: 'http://your.app.url'
            }).verifyHmac()
        }).should.throw('缺少参数');
    });
    //验证hmac需传入参数json对象

    it('verifyHmac should fail if time_stamp is too early', function () {
        var auth = new Yhsd.Auth({
            appKey: '548e29e46091449e949a8e1ffe4e4167',
            appSecret: 'b9fec3d128064ea89f1e9b8324eeabc5' + 'error',
            callbackUrl: 'http://your.app.url'
        });
        var queryObj = {
            hmac:'123456',
            a:1,
            b:2,
            time_stamp: new Date(Date.now() - 1e6).toString(),
        };
        auth.verifyHmac(queryObj).should.be.false();
        //验证hmac需传入参数json对象,此处的json对象是测试的,请勿直接使用
    });

    it('verifyHmac should fail', function () {
        var auth = new Yhsd.Auth({
            appKey: '548e29e46091449e949a8e1ffe4e4167',
            appSecret: 'b9fec3d128064ea89f1e9b8324eeabc5' + 'error',
            callbackUrl: 'http://your.app.url'
        });
        var queryObj = {
            hmac:'123456',
            a:1,
            b:2,
            time_stamp: new Date().toString(),
        };
        auth.verifyHmac(queryObj).should.be.false();
        //验证hmac需传入参数json对象,此处的json对象是测试的,请勿直接使用
    });

    it('verifyHmac should pass', function () {
        var appSecret = 'b9fec3d128064ea89f1e9b8324eeabc5' + 'error';
        var auth = new Yhsd.Auth({
            appKey: '548e29e46091449e949a8e1ffe4e4167',
            appSecret: appSecret,
            callbackUrl: 'http://your.app.url'
        });
        var queryObj = {
            hahaha:'abc134.@$%',
            chinese:'1234567890你好友好速搭棒棒的',
            time_stamp: new Date().toString(),
        };
        var hmac = crypto.createHmac('sha256', appSecret).update(decodeURIComponent(querystring.stringify(queryObj)), 'utf8').digest('hex');
        queryObj.hmac = hmac;
        auth.verifyHmac(queryObj).should.be.true();
        //验证hmac需传入参数json对象,此处的json对象是测试的,请勿直接使用
    });

    it('get customerData should be success', function () {
        var auth = new Yhsd.Auth({
            appKey: '548e29e46091449e949a8e1ffe4e4167',
            appSecret: 'b9fec3d128064ea89f1e9b8324eeabc5',
            callbackUrl: 'http://your.app.url'
        });
        var queryObj = {
            hmac:'123456',
            a:1,
            b:2
        };
        auth.customerData('b9fec3d128064ea89f1e9b8324eeabc5',{name:'aaa'}).should.equal('1e31b74ce913307c46151da57b225fa3');
    });
});
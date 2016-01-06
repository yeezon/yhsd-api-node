/**
 * Created by obzerg on 16/1/5.
 */
var should = require('should');
var Yhsd = require('../index');

describe('test/webhook.test.js', function () {
    var webHook;
    before(function () {
        webHook = new Yhsd.WebHook('fbc7f83524f14e358a325a5066acd741');
    });
    it('get webhook instance should be fail', function () {
        (function () {
            new Yhsd.WebHook()
        }).should.throw('缺少参数');
    });

    it('verifyHmac should be throw error', function () {
        (function () {
            webHook.verifyHmac()
        }).should.throw('缺少参数');
    });

    it('verifyHmac should be fail', function () {
            webHook.verifyHmac('123','123').should.be.false();
    });
})
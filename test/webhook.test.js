/**
 * Created by obzerg on 16/1/5.
 */
var should = require('should');
var YhsdParamError = require('../lib/Error').YhsdParamError;
var Yhsd = require('../index');

describe('test/webhook.test.js', function () {
    var webHook;
    before(function () {
        webHook = new Yhsd.WebHook('fbc7f83524f14e358a325a5066acd741');
    });
    it('get webhook instance should be fail', function () {
        (function () {
            new Yhsd.WebHook()
        }).should.throw(YhsdParamError);
    });

    it('verifyHmac should be throw error', function () {
        (function () {
            webHook.verifyHmac()
        }).should.throw(YhsdParamError);
    });

    it('verifyHmac should be fail', function () {
        webHook.verifyHmac('123', '123').should.be.false();
    });

    it('should verify hmac as correct', function () {
        webHook.verifyHmac('Fp6SL4UABMWhXojvSGBneRs0h0wEnqxQrqT/ko/mqg0=', '12345qwert').should.be.true();
    });

    it('should verify hmac in Chinese as correct', function () {
        webHook.verifyHmac('FXX5JR4sC7Z6kktz/vhxLcy3ydEdIHWpAHnqOxnXhJU=', '12345qwert友好速搭很棒').should.be.true();
    })
});
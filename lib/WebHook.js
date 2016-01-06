var cryptoJs = require('crypto-js'),
  paramError = new Error('缺少参数');

/**
 * 初始化
 * @param {string} webHookToken
 */
var WebHook = function(webHookToken) {
  if (arguments.length < 1) {
    throw paramError;
  }
  this.token = webHookToken;
};

WebHook.prototype = {
  /**
   * 验证 Hmac
   * @param {string} hmac
   * @param {string} bodyData 响应体数据
   * @return {boolean}
   */
  verifyHmac: function(hmac, bodyData) {
    if (arguments.length < 2) {
      throw paramError;
    }
    return hmac == cryptoJs.HmacSHA256(bodyData, this.token).toString(cryptoJs.Base64);
  }
};

module.exports = WebHook;

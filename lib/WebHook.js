var crypto = require('crypto'),
  paramError = new Error('缺少参数');

var WebHook = function(token) {
  if (arguments.length < 1) {
    throw paramError;
  }
  this.token = token;
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
    return hmac == crypto.createHmac('sha256', this.token).update(bodyData).digest('base64');
  }
};

module.exports = WebHook;

var paramError = new Error('缺少参数');
const crypto = require('crypto');

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
    var calculatedHmac = crypto.createHmac('sha256', this.token).update(bodyData, 'utf8').digest('base64');
    return hmac === calculatedHmac;
  }
};

module.exports = WebHook;

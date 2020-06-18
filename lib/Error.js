var util = require('./util')

function YhsdError(message) {
  var e = new Error()
  e.name = this.name = 'YhsdError';
  this.message = message || '';
  this.stack = (e).stack;
}
YhsdError.prototype = Object.create(Error.prototype);
YhsdError.prototype.constructor = YhsdError;

module.exports.YhsdError = YhsdError

function YhsdParamError() {
  var message = '参数异常';
  if (util.isString(arguments[0])) message = '参数异常: ' + arguments.join(';');
  if (util.isArray(arguments[0])) message = '缺少参数: ' + arguments[0].join(',');

  var e = new Error()
  e.name = this.name = 'YhsdParamError';
  this.message = message;
  this.stack = (e).stack;
}
YhsdParamError.prototype = Object.create(Error.prototype);
YhsdParamError.prototype.constructor = YhsdParamError;

module.exports.YhsdParamError = YhsdParamError
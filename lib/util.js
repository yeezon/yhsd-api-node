module.exports = {
  isPromise: function (object) {
    return object && this.isObject(object) && this.isFunction(object.then);
  },
  isString: function (string) {
    return typeof string === 'string';
  },
  isArray: function (array) {
    return typeof array === 'object' && array instanceof Array;
  },
  isObject: function (object) {
    return typeof object === 'object';
  },
  isFunction: function (fn) {
    return typeof fn === 'function';
  }
};
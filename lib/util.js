module.exports = {
  isPromise: function (object) {
    return object && this.isObject(object) && this.isFunction(object.then);
  },
  isObject: function (object) {
    return typeof object === 'object';
  },
  isFunction: function (fn) {
    return typeof fn === 'function';
  }
};
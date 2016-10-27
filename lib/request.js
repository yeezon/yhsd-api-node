var querystring = require('querystring'),
  config = require('./config'),
  requestCount = 0,
  fnReduceRequestCount = function() {
    requestCount--;
  };

var request = function(options, params, callback) {
  if (requestCount == config.requestLimit) {
    setTimeout(request, config.requestTimeout, options, params, callback);
    return;
  }
  requestCount++;
  var req = config.http.request(options, function(res) {
    var buf = [];
    res.on('end', function() {
      var data = Buffer.concat(buf).toString();
      try {
        data = JSON.parse(data);
      } catch (err) {
        callback(err);
      } finally {
        setTimeout(fnReduceRequestCount, config.requestLimit * config.requestTimeout * eval(res.headers['x-yhsd-shop-api-call-limit']));
      }
      callback(null, data);
    });
    res.on('data', function(data) {
      buf.push(data);
    });
    res.on('error', function(err) {
      callback(err);
    });
  });
  if (params) {
    var stringify;
    if (options.headers['Content-Type'] && options.headers['Content-Type'].toLowerCase() == 'application/x-www-form-urlencoded') {
      stringify = querystring.stringify;
    } else {
      switch(options.method.toUpperCase()) {
        case 'POST':
        case 'PUT':
          stringify = JSON.stringify;
          break;
      }
    }
    req.write(stringify(params));
  }
  req.end();
};

module.exports = request;

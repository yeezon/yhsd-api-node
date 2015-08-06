var querystring = require('querystring'),
  config = require('./config'),
  requestCount = 0,
  fnReduceRequestCount = function() {
    requestCount--;
  };

var request = function(options, postData, callback) {
  if (requestCount == config.requestLimit) {
    setTimeout(request, 500, options, postData, callback);
    return;
  }
  requestCount++;
  var req = config.http.request(options, function(res) {
    var buf = [];
    res.on('end', function() {
      var data = Buffer.concat(buf).toString();
      try {
        data = JSON.parse(data);
        if (data.code == 429) {
          requestCount = config.requestLimit;
          setTimeout(request, 500, options, postData, callback);
          return;
        }
      } catch (err) {
        callback(err);
      } finally {
        setTimeout(fnReduceRequestCount, config.requestLimit * 500 * eval(res.headers['x-yhsd-shop-api-call-limit']));
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
  postData && (req.write(querystring.stringify(postData)));
  req.end();
};

module.exports = request;

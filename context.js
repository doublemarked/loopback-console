var mockContext = null;

exports.makeMockContext = function () {
  var storage = {};

  return {
    get: function (name) { return storage[name]; },
    set: function (name, val) { storage[name] = val; },
    reset: function (/*name, val*/) { throw 'unimplemented'; }
  };

};

exports.useMockContext = function (loopback, context) {
  loopback = loopback || require('loopback');
  mockContext = context || mockContext || exports.makeMockContext();

  loopback.getCurrentContext = function() {
    return mockContext;
  };

  return mockContext;
};

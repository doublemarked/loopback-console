var dummyContext = null;

exports.makeDummyContext = function () {
  var storage = {};

  return {
    get: function (name) { return storage[name]; },
    set: function (name, val) { storage[name] = val; },
    reset: function (/*name, val*/) { throw 'unimplemented'; }
  };

};

exports.useDummyContext = function (loopback, context) {
  loopback = loopback || require('loopback');
  dummyContext = context || dummyContext || exports.makeDummyContext();

  loopback.getCurrentContext = function() {
    return dummyContext;
  };

  return dummyContext;
};

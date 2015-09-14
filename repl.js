var vm = require('vm');
var util = require('util');

var repl = require('repl');
var _ = require('lodash');

module.exports = {
  start: function (ctx, handles) {
    var config = _.clone(ctx.config);
    config.eval = config.eval || loopbackAwareEval;

    var replServer = repl.start(config);

    replServer.on('exit', process.exit);

    _.extend(replServer.context, handles);

    if (handles.cb === true) {
      replServer.context.result = undefined;
      replServer.context.cb = function (err, res) {
        if (err) console.error('Error: '+err);
        replServer.context.result = res;
        if (!config.quiet) {
          console.log(res);
        }
      };
    }

    return replServer;
  }
};

// Much of this is borrowed from the default REPLServer eval
function loopbackAwareEval(code, context, file, cb) {
  var err, result, script;
  // first, create the Script object to check the syntax
  try {
    script = vm.createScript(code, {
      filename: file,
      displayErrors: false
    });
  } catch (e) {
    if (isRecoverableError(e)) {
      err = new Recoverable(e);
    } else {
      err = e;
    }
  }

  if (!err) {
    try {
      result = script.runInThisContext({ displayErrors: false });
      if (typeof Promise !== 'undefined' && result instanceof Promise) {
        result.then(function (r) {
          _.each(context, function (v, k) {
            if (context[k] === result) {
              context[k] = r;
            }
          });
          cb(null, r);
        }).catch(cb);
        return;
      }
    } catch (e) {
      err = e;
      if (err && process.domain) {
        process.domain.emit('error', err);
        process.domain.exit();
        return;
      }
    }
  }

  cb(err, result);
}

function isRecoverableError(e) {
  return e &&
  e.name === 'SyntaxError' &&
  /^(Unexpected end of input|Unexpected token)/.test(e.message);
}

function Recoverable(err) {
  this.err = err;
}
util.inherits(Recoverable, SyntaxError);

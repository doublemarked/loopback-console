var vm = require('vm');
var util = require('util');

var repl = require('repl');
var _ = require('lodash');

var Recoverable;

module.exports = {
  start: function (ctx) {
    var self = this;
    var config = _.clone(ctx.config);

    var replServer = repl.start(config);

    // Trick REPLServer into giving us a Recoverable instance. This is necessary in order
    // for us to build our own Recoverable instances, which is necessary for us to support
    // multi-line input. Unfortunately REPLServer does not otherwise expose Recoverable.
    replServer.eval('var bogus =', null, null, function (err) {
      Recoverable = err.constructor;
      replServer.eval = replServer._domain.bind(config.eval || loopbackAwareEval);
    });

    replServer.context.rs = replServer;

    _.extend(replServer.context, ctx.handles);
    replServer.on('exit', process.exit);

    if (ctx.handles.cb === true) {
      replServer.context.result = undefined;
      replServer.context.cb = function (err, res) {
        if (err) console.error('Error: '+err);
        replServer.context.result = res;
        if (!config.quiet) {
          console.log(res);
        }
      };
    }

    replServer.defineCommand('usage', {
      help: 'Detailed Loopback Console usage information',
      action: function () {
        this.outputStream.write(self.usage(ctx, true));
        this.displayPrompt();
      }
    });

    replServer.defineCommand('models', {
      help: 'Display available Loopback models',
      action: function () {
        this.outputStream.write(_.keys(ctx.models).join(', ')+'\n');
        this.displayPrompt();
      }
    });

    return replServer;
  },

  usage: function (ctx, details) {
    var usage =
      '============================================\n' +
      'Loopback Console\n\n' +
      'Primary handles available:\n';
    _.each(ctx.handleInfo, function (v, k) {
      usage += '  -'+k+': '+v+'\n';
    });

    var customHandles = _.filter(_.keys(ctx.handles), function (k) { return !ctx.handleInfo[k] && !ctx.models[k]; });
    if (!_.isEmpty(ctx.models) || !_.isEmpty(ctx.customHandles)) {
      usage += '\nOther handles available:\n';
    }
    if (!_.isEmpty(ctx.models)) {
      usage += '  - Models: ' + _.keys(ctx.models).join(', ') + '\n';
    }
    if (!_.isEmpty(customHandles)) {
      usage += '  - Custom: ' + customHandles.join(',') + '\n';
    }

    if (details) {
      usage +=
        '\nExamples:\n'+
        '  loopback > myUser = User.findOne({ where: { userame: \'heath\' })\n' +
        '  loopback > myUser.updateAttribute(\'fullName\', \'Heath Morrison\')\n' +
        '  loopback > myUser.widgets.add({ ... })\n\n';
    }
    usage += '============================================\n\n';

    if (details) {

    }

    return usage;
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

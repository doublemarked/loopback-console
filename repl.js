'use strict';

const repl = require('repl');
const replHistory = require('./history');

const LoopbackRepl = module.exports = {
  start(ctx) {
    const config = Object.assign({}, ctx.config);
    const replServer = repl.start(config);

    Object.assign(replServer.context, ctx.handles);

    replServer.eval = wrapReplEval(replServer);

    if (ctx.handles.cb === true) {
      replServer.context.result = undefined;
      replServer.context.cb = (err, result) => {
        replServer.context.err = err;
        replServer.context.result = result;

        if (err) {
          console.error('Error: ' + err);
        }
        if (!config.quiet) {
          console.log(result);
        }
      };
    }

    replServer.defineCommand('usage', {
      help: 'Detailed Loopback Console usage information',
      action() {
        this.outputStream.write(LoopbackRepl.usage(ctx, true));
        this.displayPrompt();
      },
    });

    replServer.defineCommand('models', {
      help: 'Display available Loopback models',
      action() {
        this.outputStream.write(Object.keys(ctx.models).join(', ') + '\n');
        this.displayPrompt();
      },
    });

    replServer.on('exit', function() {
      if (replServer._flushing) {
        replServer.pause();
        return replServer.once('flushHistory', function() {
          process.exit();
        });
      }
      process.exit();
    });

    return replHistory(replServer, config.historyPath).then(() => replServer);
  },

  usage(ctx, details) {
    const modelHandleNames = Object.keys(ctx.models);
    const customHandleNames = Object.keys(ctx.handles).filter(k => {
      return !ctx.handleInfo[k] && !ctx.models[k];
    });

    let usage =
      '============================================\n' +
      'Loopback Console\n\n' +
      'Primary handles available:\n';

    Object.keys(ctx.handleInfo).forEach(key => {
      usage += ` - ${key}: ${ctx.handleInfo[key]}\n`;
    });

    if (modelHandleNames.length > 0 || ctx.customHandleNames.length > 0) {
      usage += '\nOther handles available:\n';
    }
    if (modelHandleNames.length > 0) {
      usage += `  - Models: ${ modelHandleNames.join(', ') }\n`;
    }
    if (customHandleNames.length > 0) {
      usage += `  - Custom: ${ customHandleNames.join(',') }\n`;
    }

    if (details) {
      usage +=
        '\nExamples:\n' +
        ctx.config.prompt +
        'myUser = User.findOne({ where: { username: \'heath\' })\n' +
        ctx.config.prompt +
        'myUser.updateAttribute(\'fullName\', \'Heath Morrison\')\n' +
        ctx.config.prompt +
        'myUser.widgets.add({ ... })\n\n';
    }
    usage += '============================================\n\n';

    return usage;
  },
};

// Wrap the default eval with a handler that resolves promises
function wrapReplEval(replServer) {
  const defaultEval = replServer.eval;

  return function(code, context, file, cb) {
    return defaultEval.call(this, code, context, file, (err, result) => {
      if (!result || !result.then) {
        return cb(err, result);
      }

      result.then(resolved => {
        resolvePromises(result, resolved);
        cb(null, resolved);
      }).catch(err => {
        resolvePromises(result, err);

        console.log('\x1b[31m' + '[Promise Rejection]' + '\x1b[0m');
        if (err && err.message) {
          console.log('\x1b[31m' + err.message + '\x1b[0m');
        }

        // Application errors are not REPL errors
        cb(null, err);
      });
    });

    function resolvePromises(promise, resolved) {
      Object.keys(context).forEach(key => {
        // Replace any promise handles in the REPL context with the resolved promise
        if (context[key] === promise) {
          context[key] = resolved;
        }
      });
    }
  };
}

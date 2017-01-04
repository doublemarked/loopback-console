'use strict';

const repl = require('./repl');

const DEFAULT_REPL_CONFIG = {
  quiet: false,
  prompt: 'loopback > ',
  useGlobal: true,
  ignoreUndefined: true,
  historyPath: process.env.LOOPBACK_CONSOLE_HISTORY,
};

const DEFAULT_HANDLE_INFO = {
  app: 'The Loopback app handle',
  cb: 'A simplistic results callback that stores and prints',
  result: 'The handle on which cb() stores results',
};

const LoopbackConsole = module.exports = {
  activated() {
    return process.env.LOOPBACK_CONSOLE == 'true' ||
           process.env.LOOPBACK_CONSOLE == 1 ||
           process.argv.includes('--console');
  },

  start(app, config) {
    if (this._started) {
      return Promise.resolve(this._ctx);
    }
    this._started = true;

    config = Object.assign({}, DEFAULT_REPL_CONFIG, config);
    const ctx = this._ctx = {
      app,
      config,
      handles: config.handles || {},
      handleInfo: config.handleInfo || {},
      models: {},
    };

    Object.keys(app.models).forEach(modelName => {
      if (!(modelName in ctx.handles)) {
        ctx.models[modelName] = ctx.handles[modelName] = app.models[modelName];
      }
    });

    if (!('app' in ctx.handles)) {
      ctx.handles.app = app;
      ctx.handleInfo.app = DEFAULT_HANDLE_INFO.app;
    }

    if (ctx.handles.cb === true || !('cb' in ctx.handles)) {
      ctx.handles.cb = true;
      ctx.handleInfo.cb = DEFAULT_HANDLE_INFO.cb;
      ctx.handleInfo.result = DEFAULT_HANDLE_INFO.result;
    }

    if (!config.quiet) {
      console.log(repl.usage(ctx));
    }

    return repl.start(ctx).then(repl => {
      ctx.repl = repl;
      return ctx;
    });
  },

};

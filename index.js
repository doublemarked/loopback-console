var _ = require('lodash');

var repl = require('./repl');
var contextUtils = require('./context');

var DEFAULT_CONFIG = {
  quiet: false,
  prompt: 'loopback > ',
  useGlobal: true,
  ignoreUndefined: true,
  useMockContext: true
};

var DEFAULT_HANDLE_INFO = {
  ld: 'Lodash',
  app: 'The Loopback app handle',
  context: 'The mock Loopback context',
  cb: 'A simplistic results callback that stores and prints',
  result: 'The handle on which cb() stores results'
};

module.exports = {
  activated: function () {
    /* jshint eqeqeq:false */
    var envVarEnable = (process.env.LOOPBACK_CONSOLE == 'true' || process.env.LOOPBACK_CONSOLE == 1);
    return envVarEnable || _.contains(process.argv, '--console');
  },

  start: function (app, config, cb) {
    if (!cb && _.isFunction(config)) {
      cb = config;
      config = {};
    }

    config = _.extend({}, DEFAULT_CONFIG, config);

    var ctx = {
      app: app,
      lbContext: undefined,
      config: config,
      handles: config.handles || {},
      handleInfo: {},
      models: {}
    };

    if (config.useMockContext) {
      ctx.lbContext = contextUtils.useMockContext(app.loopback);
    }

    _.forOwn(ctx.handles.models || app.models, function (model) {
      if (!ctx.handles[model.modelName]) {
        ctx.handles[model.modelName] = model;
        ctx.models[model.modelName] = model;
        delete ctx.handles.models;
      }
    });

    if (!_.has(ctx.handles, 'ld')) {
      ctx.handles.ld = _;
      ctx.handleInfo.ld = DEFAULT_HANDLE_INFO.ld;
    }
    if (!_.has(ctx.handles, 'app')) {
      ctx.handles.app = app;
      ctx.handleInfo.app = DEFAULT_HANDLE_INFO.app;
    }
    if (!_.has(ctx.handles, 'cb') || ctx.handles.cb === true) {
      ctx.handles.cb = true;
      ctx.handleInfo.cb = DEFAULT_HANDLE_INFO.cb;
      ctx.handleInfo.result = DEFAULT_HANDLE_INFO.result;
    }
    if (ctx.lbContext && !_.has(ctx.handles, 'context')) {
      ctx.handles.context = ctx.lbContext;
      ctx.handleInfo.context =  DEFAULT_HANDLE_INFO.context;
    }

    if (!config.quiet) {
      console.log(repl.usage(ctx));
    }

    ctx.repl = repl.start(ctx);

    return cb && cb(null, ctx);
  },

  cli: function () {
    var cwd = process.cwd();
    var appPath = process.argv[2] || 'server/server';

    var failBadPath = function () {
      console.error('Error: Loopback app not loadable at path '+appPath+'!');
      process.exit(1);
    };

    try {
      var app = require(cwd+'/'+appPath);
      if (!app.loopback) {
        failBadPath();
      }
      module.exports.start(app);
    } catch(err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        failBadPath();
      } else {
        throw(err);
      }
    }
  }
};

if (require.main === module) {
  module.exports.cli();
}

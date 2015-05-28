var _ = require('lodash');

var repl = require('./repl');
var contextUtils = require('./context');

var DEFAULT_CONFIG = {
  quiet: false,
  prompt: 'loopback > ',
  useGlobal: true,
  ignoreUndefined: true,
  useDummyContext: true,
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

    var dummyContext;
    var handles = config.handles || {};
    var handleInfo = {};
    var models = {};

    if (config.useDummyContext) {
      dummyContext = contextUtils.useDummyContext(app.loopback);
    }

    _.forOwn(handles.models || app.models, function (model) {
      if (!handles[model.modelName]) {
        handles[model.modelName] = model;
        models[model.modelName] = model;
        delete handles.models;
      }
    });

    if (!_.has(handles, 'ld')) {
      handles.ld = _;
      handleInfo.ld = 'Lodash';
    }
    if (!_.has(handles, 'app')) {
      handles.app = app;
      handleInfo.app = 'The Loopback app handle';
    }
    if (!_.has(handles, 'cb') || handles.cb === true) {
        handles.cb = true;
        handleInfo.cb = 'A simplistic results callback that stores and prints';
        handleInfo.result = 'The handle on which cb() stores results';
    }
    if (!_.has(handles, 'context')) {
        handles.context = dummyContext;
        handleInfo.context = 'The dummy Loopback context';
    }

    if (!config.quiet) {
      console.log('============================================');
      console.log('Loopback Console\n');
      console.log('Primary handles available: ');
      _.each(handleInfo, function (v, k) {
        console.log('  -', k+':', v);
      });


      var customHandles = _.filter(_.keys(handles), function (k) { return !handleInfo[k] && !models[k]; });
      if (!_.isEmpty(models) || !_.isEmpty(customHandles)) {
        console.log('\nOther handles available:');
      }
      if (!_.isEmpty(models)) {
        console.log('  - Models:', _.keys(models).join(', '));
      }
      if (!_.isEmpty(customHandles)) {
        console.log('  - Custom:', customHandles.join(','));
      }
      console.log('============================================\n');
    }

    var ctx = { app: app, config: config };
    ctx.repl = repl.start(ctx, handles);

    return cb && cb(null, ctx);
  },

  cli: function () {
    var cwd = process.cwd();
    var appPath = process.argv[2] || 'server/server';

    var failBadPath = function () {
      console.error('Error: Loopback app not found at path '+appPath+'!');
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

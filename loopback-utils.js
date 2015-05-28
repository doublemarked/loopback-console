var _ = require('lodash');

module.exports = {
  getDistinctModels: function (app) {
    var models = {};
    _.forOwn(app.models, function (model) {
      if (!models[model.modelName]) {
        models[model.modelName] = model;
      }
    });

    return models;
  },

  associateUser: function (model, username) {
    model = app.models
  }
};

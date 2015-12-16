'use strict';

/**
 * Module dependencies.
 */
var homePolicy = require('../policies/home.server.policy'),
  home = require('../controllers/home.server.controller');


module.exports = function (app) {
  app.route('/api/home/getOrganizations').all(homePolicy.isAllowed)
    .post(home.getOrganizations);
  app.route('/api/home/getRepositories').all(homePolicy.isAllowed)
    .post(home.getRepositories);
    app.route('/api/home/addWebhook').all(homePolicy.isAllowed)
      .post(home.addWebhook);
};

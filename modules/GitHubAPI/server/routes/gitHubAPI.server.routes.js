'use strict';

/**
 * Module dependencies.
 */
var gitHubAPIPolicy = require('../policies/gitHubAPI.server.policy'),
  gitHubAPI = require('../controllers/gitHubAPI.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/gitHubAPI').all(gitHubAPIPolicy.isAllowed)
    .get(gitHubAPI.list)
    .post(gitHubAPI.call);

};

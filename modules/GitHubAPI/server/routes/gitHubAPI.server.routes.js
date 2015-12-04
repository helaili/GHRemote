'use strict';

/**
 * Module dependencies.
 */
var gitHubAPIPolicy = require('../policies/gitHubAPI.server.policy'),
  gitHubAPI = require('../controllers/gitHubAPI.server.controller');

module.exports = function (app) {
  app.route('/api/gitHubAPI/deployement').all(gitHubAPIPolicy.isAllowed)
    .post(gitHubAPI.deployement);

  app.route('/api/gitHubAPI/deployementStatus').all(gitHubAPIPolicy.isAllowed)
    .post(gitHubAPI.deployementStatus);
    
  app.route('/api/gitHubAPI').all(gitHubAPIPolicy.isAllowed)
    .get(gitHubAPI.list)
    .post(gitHubAPI.call);

};

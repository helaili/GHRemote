'use strict';

/**
 * Module dependencies.
 */
var impersonationPolicy = require('../policies/impersonation.server.policy'),
  impersonation = require('../controllers/impersonation.server.controller');

module.exports = function (app) {
  app.route('/api/impersonation/pushValidator').all(impersonationPolicy.isAllowed)
    .post(impersonation.pushValidator);

  app.route('/api/impersonation/getCommit').all(impersonationPolicy.isAllowed)
    .post(impersonation.getCommit);

  app.route('/api/impersonation/getPullRequestCommits').all(impersonationPolicy.isAllowed)
    .post(impersonation.getPullRequestCommits);
};

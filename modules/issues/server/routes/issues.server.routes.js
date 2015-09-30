'use strict';

/**
 * Module dependencies.
 */
var issuesPolicy = require('../policies/issues.server.policy'),
  issues = require('../controllers/issues.server.controller');

module.exports = function (app) {
  // Issues collection routes
  app.route('/api/issues').all(issuesPolicy.isAllowed)
    .get(issues.list)
    .post(issues.create);

  // Single issue routes
  app.route('/api/issues/:issueId').all(issuesPolicy.isAllowed)
    .get(issues.read)
    .put(issues.update)
    .delete(issues.delete);

  // Finish by binding the issue middleware
  app.param('issueId', issues.issueByID);
};

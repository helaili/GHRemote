'use strict';

/**
 * Module dependencies.
 */
var issuesPolicy = require('../policies/issues.server.policy'),
  issues = require('../controllers/issues.server.controller');

module.exports = function (app) {
  // Issues collection routes
  app.route('/api/issues/read').all(issuesPolicy.isAllowed)
    .post(issues.read);


  // Single issue routes
  app.route('/api/issues/:issueId').all(issuesPolicy.isAllowed)
    .get(issues.read)
    .put(issues.update)
    .delete(issues.delete);

  app.route('/api/issues').all(issuesPolicy.isAllowed)
    .get(issues.list)
    .post(issues.create);

  // Finish by binding the issue middleware
  app.param('issueId', issues.issueByID);
};

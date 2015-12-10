'use strict';

/**
 * Module dependencies.
 */
var deploymentPolicy = require('../policies/deployment.server.policy'),
  deployment = require('../controllers/deployment.server.controller');

//http://192.168.231.1:300/api/deployment/deploy

module.exports = function (app) {
  app.route('/api/deployment/deploy').all(deploymentPolicy.isAllowed)
    .post(deployment.deploy);

};

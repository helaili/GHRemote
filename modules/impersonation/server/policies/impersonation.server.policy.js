'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke gitHubAPI Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/impersonation',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/impersonation',
      permissions: ['get', 'post']
    }]
  }, {
    roles: ['guest', 'user', 'admin'],
    allows: [{
      resources: '/api/impersonation/pushValidator',
      permissions: ['post']
    }, {
      resources: '/api/impersonation/getCommit',
      permissions: ['post']
    },{
      resources: '/api/impersonation/getPullRequestCommits',
      permissions: ['post']
    }
  ]
  }]);
};

/**
 * Check If API Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred.
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};

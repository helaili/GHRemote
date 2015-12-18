'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.server.controller'),
    homePolicy = require('../policies/home.server.policy'),
    home = require('../controllers/home.server.controller');

  app.route('/api/home/getWebhooks').all(homePolicy.isAllowed)
    .get(home.getWebhooks);

  app.route('/api/home/getOrganizations').all(homePolicy.isAllowed)
    .post(home.getOrganizations);

  app.route('/api/home/getRepositories').all(homePolicy.isAllowed)
    .post(home.getRepositories);

  app.route('/api/home/addWebhook').all(homePolicy.isAllowed)
      .post(home.addWebhook);

  // Define error pages
  app.route('/server-error').get(core.renderServerError);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);

  // Define application route
  app.route('/*').get(core.renderIndex);
};

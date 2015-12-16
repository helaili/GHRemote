'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  url = require('url'),
	https = require('https'),
  querystring = require('querystring'),
  config = require(path.resolve('./config/config')),
  winston = require('winston'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

winston.loggers.add('Home', {
  console: {
    level: config.winston.Home.console.level,
    colorize: true,
    label: config.winston.Home.label
  },
  file: {
    level: config.winston.Home.file.level,
    filename: config.winston.Home.file.filename,
    label: config.winston.Home.label
  }
});

var logger = winston.loggers.get('Home');


exports.getOrganizations = function (req, res) {
  callGitHubApi(res, req.user.providerData, '/api/v3/user/orgs');
};

exports.getRepositories = function(req, res) {
  callGitHubApi(res, req.user.providerData, '/api/v3/user/repos');
};

function callGitHubApi(res, user, apiPath) {
  var orgsAPIURL = url.parse(user.organizations_url);

  var options = {
    'host': orgsAPIURL.host,
    'path': apiPath,
    'method': 'GET',
    'headers' : {
      'Authorization' : 'token ' + user.accessToken,
      'Accept': 'application/vnd.github.v3+json'
    }
  };

  var apiRequest = https.request(options, function(apiResponse) {
    var responseBodyStr = '';
    logger.debug('home.server.controller.callGitHubApi - HTTP target : ' + options.path);
    logger.debug('home.server.controller.callGitHubApi - HTTP status : ' + apiResponse.statusCode);
    logger.debug('home.server.controller.callGitHubApi - HTTP headers', apiResponse.headers);

    apiResponse.setEncoding('utf8');

    apiResponse.on('data', function (chunk) {
      responseBodyStr = responseBodyStr.concat(chunk);
    });

    apiResponse.on('end', function() {
      logger.debug('home.server.controller.callGitHubApi - Result', responseBodyStr);
      return res.status(200).send(responseBodyStr);
    });
  });

  apiRequest.on('error', function(e) {
    logger.error('home.server.controller.callGitHubApi - ' + apiPath, e);
    return res.status(400).send(e);
  });

  apiRequest.end();
}

exports.addWebhook = function(req, res) {
  logger.debug('home.server.controller.addWebhook - Post Data : ', req.body);
};

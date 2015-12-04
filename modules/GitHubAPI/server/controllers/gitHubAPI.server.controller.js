'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Push = mongoose.model('Push'),
  Commit = mongoose.model('Commit'),
	url = require('url'),
	https = require('https'),
  querystring = require('querystring'),
  config = require(path.resolve('./config/config')),
  winston = require('winston'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

winston.loggers.add('GitHubAPI', {
  console: {
    level: config.winston.GitHubAPI.console.level,
    colorize: true,
    label: config.winston.GitHubAPI.label
  },
  file: {
    level: config.winston.GitHubAPI.file.level,
    filename: config.winston.GitHubAPI.file.filename,
    label: config.winston.GitHubAPI.label
  }
});

 var logger = winston.loggers.get('GitHubAPI');

/**
 * Create a article
 */
exports.call = function (req, res) {
  var options = {
    'host': config.github.githubHost,
    'path': req.body.endpoint,
    'method': 'GET',
    'rejectUnauthorized' : false,
    'headers' : {
      'Authorization' : 'token ' + req.user.providerData.accessToken,
      'Accept': 'application/vnd.github.v3.full+json'
    }
  };


  var restClient = https;
  var apiResBody = '';


  var request = restClient.request(options, function(apiRes) {
    apiRes.setEncoding('utf8');

    apiRes.on('data', function (chunk) {
      apiResBody += chunk;
    });

    apiRes.on('error', function (chunk) {

    });

    apiRes.on('end',function() {
      res.json({'callResult' : apiResBody});
    });
  });

  request.end();
};

exports.list = function (req, res) {
  logger.debug('In gitHubAPI.server.controller.list');

  res.json({'message' : 'Awwww Yisss'});
};

exports.deployement = function (req, res) {
  res.json({'message' : 'Awwww Yisss, some deployement'});
};

exports.deployementStatus = function (req, res) {
  res.json({'message' : 'Awwww Yisss, some deployement status'});
};

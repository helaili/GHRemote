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

var host = null;

winston.loggers.add('Deployment', {
  console: {
    level: config.winston.Deployment.console.level,
    colorize: true,
    label: config.winston.Deployment.label
  },
  file: {
    level: config.winston.Deployment.file.level,
    filename: config.winston.Deployment.file.filename,
    label: config.winston.Deployment.label
  }
});

 var logger = winston.loggers.get('Deployment');


/***
 * Recieve a Deployment event
 ***/

exports.deploy = function (req, res) {
  logger.debug('deployment.server.controller.deploy - A deployment has been requested', req.body);

  if(req.body.zen) {
    // Ping event
    return res.status(200).send({'message' : 'I am zen too' });
  }

  var user = req.profile;

  var deploymentAPIURL = url.parse(req.body.deployment.statuses_url);

  var options = {
    'host': deploymentAPIURL.host,
    'path': deploymentAPIURL.path,
    'method': 'POST',
    'headers' : {
      'Authorization' : 'token ' + user.providerData.accessToken,
      'Accept': 'application/vnd.github.v3+json'
    }
  };

  //YES!, enconding the encoded url - Angular weirdness here? 
  var postData = {
    "state": "pending",
    "target_url": 'http://'.concat(req.headers.host).concat('/deployment/view/').concat(encodeURIComponent(encodeURIComponent(req.body.deployment.statuses_url))),
    "description": "Working on it!"
  };

  var apiRequest = https.request(options, function(apiResponse) {
    var responseBodyStr = '';
    logger.debug('deployment.server.controller.deploy - HTTP target : ' + options.path);
    logger.debug('deployment.server.controller.deploy - HTTP status : ' + apiResponse.statusCode);
    logger.debug('deployment.server.controller.deploy - HTTP headers', apiResponse.headers);

    apiResponse.setEncoding('utf8');

    apiResponse.on('data', function (chunk) {
      responseBodyStr = responseBodyStr.concat(chunk);
    });

    apiResponse.on('end', function() {
      return res.status(200).send(responseBodyStr);
    });
  });

  apiRequest.on('error', function(e) {
    logger.error('deployment.server.controller.deploy - Problem setting deployment status on ' + deploymentAPIURL, e);
    return res.status(400).send(e);
  });

  apiRequest.write(JSON.stringify(postData));
  apiRequest.end();
};

/***
 * Request a new Deployment
 ***/

exports.create = function (req, res) {
  logger.debug('deployment.server.controller.create - Requesting a new deployment', req.body);

  var user = req.user;
  // user.providerData.url = "https://octoalaindemo/api/v3/users/helaili"
  var deploymentAPIURL = url.parse(user.providerData.url.substring(0, user.providerData.url.indexOf('/users/')).concat('/repos/').concat(req.body.repository.full_name).concat('/deployments'));

  var options = {
    'host': deploymentAPIURL.host,
    'path': deploymentAPIURL.path,
    'method': 'POST',
    'headers' : {
      'Authorization' : 'token ' + user.providerData.accessToken,
      'Accept': 'application/vnd.github.v3+json'
    }
  };


  var apiRequest = https.request(options, function(apiResponse) {
    var responseBodyStr = '';
    logger.debug('deployment.server.controller.create - HTTP target : ' + options.path);
    logger.debug('deployment.server.controller.create - HTTP status : ' + apiResponse.statusCode);
    logger.debug('deployment.server.controller.create - HTTP headers', apiResponse.headers);

    apiResponse.setEncoding('utf8');

    apiResponse.on('data', function (chunk) {
      responseBodyStr = responseBodyStr.concat(chunk);
    });

    apiResponse.on('end', function() {
      var responseObject = JSON.parse(responseBodyStr);
      responseObject.statusCode = apiResponse.statusCode;
      return res.status(200).send(responseObject);
    });
  });

  apiRequest.on('error', function(e) {
    logger.error('deployment.server.controller.create - Problem retrieving commit status on ' + deploymentAPIURL, e);
    return res.status(400).send(e);
  });

  // write data to request body
  delete req.body.repository;
  apiRequest.write(JSON.stringify(req.body));

  apiRequest.end();
};


exports.list = function (req, res) {
  logger.debug('deployment.server.controller.list - Listing deployments', req.body);

  var user = req.user;
  var deploymentAPIURL = url.parse(req.body.url.concat('/deployments'));

  var options = {
    'host': deploymentAPIURL.host,
    'path': deploymentAPIURL.path,
    'method': 'GET',
    'headers' : {
      'Authorization' : 'token ' + user.providerData.accessToken,
      'Accept': 'application/vnd.github.v3+json'
    }
  };


  var apiRequest = https.request(options, function(apiResponse) {
    var responseBodyStr = '';
    logger.debug('deployment.server.controller.list - HTTP target : ' + options.path);
    logger.debug('deployment.server.controller.list - HTTP status : ' + apiResponse.statusCode);
    logger.debug('deployment.server.controller.list - HTTP headers', apiResponse.headers);

    apiResponse.setEncoding('utf8');

    apiResponse.on('data', function (chunk) {
      responseBodyStr = responseBodyStr.concat(chunk);
    });

    apiResponse.on('end', function() {
      return res.status(200).send(responseBodyStr);
    });
  });

  apiRequest.on('error', function(e) {
    logger.error('deployment.server.controller.list - Problem retrieving commit status on ' + deploymentAPIURL, e);
    return res.status(400).send(e);
  });

  apiRequest.end();
};

exports.status = function (req, res) {
    logger.debug('deployment.server.controller.status - URL for status of deployment ', req.body);

    var user = req.user;
    var deploymentAPIURL = url.parse(decodeURIComponent(req.body.deploymentAPIURL));

    var options = {
      'host': deploymentAPIURL.host,
      'path': deploymentAPIURL.path,
      'method': 'GET',
      'headers' : {
        'Authorization' : 'token ' + user.providerData.accessToken,
        'Accept': 'application/vnd.github.v3+json'
      }
    };


    var apiRequest = https.request(options, function(apiResponse) {
      var responseBodyStr = '';
      logger.debug('deployment.server.controller.status - HTTP target : ' + options.path);
      logger.debug('deployment.server.controller.status - HTTP status : ' + apiResponse.statusCode);
      logger.debug('deployment.server.controller.status - HTTP headers', apiResponse.headers);

      apiResponse.setEncoding('utf8');

      apiResponse.on('data', function (chunk) {
        responseBodyStr = responseBodyStr.concat(chunk);
      });

      apiResponse.on('end', function() {
        return res.status(200).send(responseBodyStr);
      });
    });

    apiRequest.on('error', function(e) {
      logger.error('deployment.server.controller.list - Problem retrieving commit status on ' + deploymentAPIURL, e);
      return res.status(400).send(e);
    });

    apiRequest.end();
};

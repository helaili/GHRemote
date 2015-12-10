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
  logger.debug('deployment.server.controller.deploy - Requesting a deployment', req.body);

  return res.status(200).send({'message' : 'ok' });
};

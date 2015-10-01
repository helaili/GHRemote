'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  url = require('url'),
	https = require('https'),
  http = require('http'),
	querystring = require('querystring'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

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

/**
 * List of Articles
 */
exports.list = function (req, res) {
  res.json({'message' : 'Awwww Yisss'});
};

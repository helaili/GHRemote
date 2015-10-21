'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Issue = mongoose.model('Issue'),
  url = require('url'),
	https = require('https'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));



/**
 * Create a issue
 */
exports.create = function (req, res) {
  var issue = new Issue(req.body);
  issue.user = req.user;

  issue.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(issue);
    }
  });
};

/**
 * Show the current issue
 */
exports.read = function (req, res) {
  res.json(req.issue);
};

/**
 * Update a issue
 */
exports.update = function (req, res) {
  var issue = req.issue;

  issue.title = req.body.title;
  issue.content = req.body.content;

  issue.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(issue);
    }
  });
};

/**
 * Delete an issue
 */
exports.delete = function (req, res) {
  var issue = req.issue;

  issue.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(issue);
    }
  });
};

/**
 * List of Issues
 */
exports.list = function (req, res) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;



  var options = {
    'host': config.github.githubHost,
    'path': '/api/v3/issues?filter=' + query.filter,
    'method': 'GET',
    'rejectUnauthorized' : false,
    'headers' : {
      'Authorization' : 'token ' + req.user.providerData.accessToken,
      'Accept': 'application/vnd.github.v3+json'
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
      res.json(JSON.parse(apiResBody));
    });
  });

  request.end();

};

/**
 * Issue middleware
 */
exports.issueByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Issue is invalid'
    });
  }

  Issue.findById(id).populate('user', 'displayName').exec(function (err, issue) {
    if (err) {
      return next(err);
    } else if (!issue) {
      return res.status(404).send({
        message: 'No issue with that identifier has been found'
      });
    }
    req.issue = issue;
    next();
  });
};

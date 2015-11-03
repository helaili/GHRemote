'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Issue = mongoose.model('Issue'),
  _url = require('url'),
	_https = require('https'),
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
  console.log('here', req.body);
  var body = JSON.parse(JSON.stringify(req.body));


  if(!body) {
    return res.send(400, {
				message: 'No body in http request'
    });
  }


  var options = {
    'host': config.github.githubHost,
    'path': '/api/v3/repos/' + body.repositoryOwner + '/' +  body.repositoryName + '/issues/' + body.issueId,
    'method': 'GET',
    'rejectUnauthorized' : false,
    'headers' : {
      'Authorization' : 'token ' + req.user.providerData.accessToken,
      'Accept': 'application/vnd.github.v3+json'
    }
  };

  var restClient = _https;
  var apiResBody = '';

  var request = restClient.request(options, function(apiRes) {
    apiRes.setEncoding('utf8');

    apiRes.on('data', function (chunk) {
      apiResBody += chunk;
    });

    apiRes.on('error', function (chunk) {
      return res.send(400, {
  				message: 'Error retrieving issue at URL ' + req.body.issueURL
      });
    });

    apiRes.on('end',function() {
      res.json(JSON.parse(apiResBody));
    });
  });

  request.end();
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
  var urlParts = _url.parse(req.url, true);
  var query = urlParts.query;

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

  var restClient = _https;
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

};

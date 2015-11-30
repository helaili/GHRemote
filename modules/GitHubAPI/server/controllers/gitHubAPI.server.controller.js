'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Push = mongoose.model('Push'),
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

function setImpersonationStatus(push, commitIndex, options, postData) {
  var statusAPIRequest = https.request(options, function(statusAPIResponse) {
    logger.debug('HTTP Status : ' + statusAPIResponse.statusCode);
    logger.debug('HTTP headers', statusAPIResponse.headers);

    statusAPIResponse.setEncoding('utf8');

    statusAPIResponse.on('end', function() {
      // Weird but otherwhise the updated field was 'field' i.e. the variable name as opposed to the variable value.
      var field = {};
      field['payload.commits.' + 0 + '.statusReported'] = true;

      mongoose.connection.collections.pushes.update({'_id' : push._id}, {'$set' : field}, function (err, res) {
        if(err) {
          logger.error(err);
        } else {
          logger.debug('Persisted the commit report event', res.result);
        }
      });
    });
  });

  statusAPIRequest.on('error', function(e) {
    console.log('problem sending back impersonation commit status : ' + e.message);
  });

  // write data to request body
  statusAPIRequest.write(JSON.stringify(postData));
  statusAPIRequest.end();
}

exports.pushValidator = function (req, res) {
  var pusher = req.body.pusher;
  var commits = req.body.commits;

  var statusAPIURL = url.parse(req.body.repository.statuses_url);

  var push = new Push();
  push.payload = req.body;

  logger.debug('Recieving a push event', push.payload);

  push.save(function(err) {
    if (err) {
      logger.error(err);
      return res.send(400, {'message' : err });
    } else {
      for(var commitCounter = 0; commitCounter < commits.length; commitCounter++) {
        var options = {
          'host': statusAPIURL.host,
          'path': statusAPIURL.path.replace('%7Bsha%7D', commits[commitCounter].id),
          'method': 'POST',
          'headers' : {
            'Authorization' : 'token ' + config.github.accessToken,
            'Accept': 'application/vnd.github.v3+json'
          }
        };

        var postData = {};

        if(commits[commitCounter].committer.email !== pusher.email) {
          postData = {
            "state": "failure",
            "target_url": "https://example.com/build/status",
            "description": "Spoofed commit",
            "context": "security/impersonation"
          };
        } else {
          postData = {
            "state": "success",
            "target_url": "https://example.com/build/status",
            "description": "Clean commit",
            "context": "security/impersonation"
          };
        }

        setImpersonationStatus(push, commitCounter, options, postData);

      }

      return res.status(200).send({'message' : 'OK' });

    }
  });

};

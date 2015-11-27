'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Push = mongoose.model('Push'),
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

exports.list = function (req, res) {
  console.log();


  res.json({'message' : 'Awwww Yisss'});
};

exports.deployement = function (req, res) {
  res.json({'message' : 'Awwww Yisss, some deployement'});
};

exports.deployementStatus = function (req, res) {
  res.json({'message' : 'Awwww Yisss, some deployement status'});
};

function setImpersonationStatus(push, commitIndex, options, postData) {
  console.log(options);

  var statusAPIRequest = https.request(options, function(statusAPIResponse) {
    console.log('STATUS: ' + statusAPIResponse.statusCode);
    console.log('HEADERS: ' + JSON.stringify(statusAPIResponse.headers));
    statusAPIResponse.setEncoding('utf8');

    statusAPIResponse.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });

    statusAPIResponse.on('end', function() {
      console.log('No more data in response.');

      // Weird but otherwhise the updated field was 'field' i.e. the variable name as opposed to the variable value.
      var field = {};
      field['payload.commits.' + 0 + '.statusReported'] = true;
      mongoose.connection.collections.pushes.update({'_id' : push._id}, {'$set' : field}, function (err, doc) {
        if(err) {
          console.log(err);
        } else {
          console.log('success');
        }
      });
    });
  });

  statusAPIRequest.on('error', function(e) {
    console.log('problem with request: ' + e.message);
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

  console.log('### BODY ###');
  console.log(push.payload);

  push.save(function(err) {
    if (err) {
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
            "description": "Spoofing alert",
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

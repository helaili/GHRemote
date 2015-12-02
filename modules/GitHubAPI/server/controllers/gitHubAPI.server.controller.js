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


/***
 * Checking the status of one commit
 ***/
function setImpersonationCommitStatus(push, options, commitIndex, foundSpoofing) {
  return new Promise(function(fulfill, reject) {
    var postData = {};

    if(foundSpoofing) {
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

    var statusAPIRequest = https.request(options, function(statusAPIResponse) {
      logger.debug('gitHubAPI.server.controller.setImpersonationCommitStatus - HTTP target : ' + options.path);
      logger.debug('gitHubAPI.server.controller.setImpersonationCommitStatus - HTTP status : ' + statusAPIResponse.statusCode);
      logger.debug('gitHubAPI.server.controller.setImpersonationCommitStatus - HTTP headers', statusAPIResponse.headers);

      statusAPIResponse.setEncoding('utf8');

      statusAPIResponse.on('data', function (chunk) {

      });

      statusAPIResponse.on('end', function() {
        logger.debug('gitHubAPI.server.controller.setImpersonationCommitStatus - Saving commit', push.payload.commits[commitIndex]);
        var commit = new Commit(push.payload.commits[commitIndex]);
        commit.spoofed = foundSpoofing;
        commit.save(function(err) {
          if (err) {
            logger.error('gitHubAPI.server.controller.setImpersonationCommitStatus - Failed saving commit : ' + err);
          }

          logger.debug('gitHubAPI.server.controller.setImpersonationCommitStatus - Promise is fulfilled');
          fulfill(foundSpoofing);
        });

        /*
        // Weird but otherwhise the updated field was 'field' i.e. the variable name as opposed to the variable value.
        var field = {};
        field['payload.commits.' + commitIndex + '.spoofedStatusReported'] = true;
        field['payload.commits.' + commitIndex + '.spoofedComment'] = foundSpoofing;

        // Updating the commit in the DB so we know the status was reported
        mongoose.connection.collections.pushes.update({'_id' : push._id}, {'$set' : field}, function (err, res) {
          if(err) {
            logger.error(err);
          } else {
            logger.debug('gitHubAPI.server.controller.setImpersonationCommitStatus - Persisted the commit report event', res.result);
          }
        });
        */

      });


    });

    statusAPIRequest.on('error', function(e) {
      logger.error('gitHubAPI.server.controller.setImpersonationCommitStatus - Problem sending back impersonation commit status : ' + e.message);
    });

    // write data to request body
    statusAPIRequest.write(JSON.stringify(postData));
    statusAPIRequest.end();
  });
}

/***
 * The last commit might be ok, but some previous ones might have been spoofed.
 * We need to prevent the merge of the PR until the history has been cleaned.
 ***/
function setImpersonationPullRequestStatus(push, foundSpoofing) {
  if(!foundSpoofing) {
    //No spoofing in the last push, so need to go back in time
    var statusAPIURL = url.parse(push.payload.repository.commits_url);

    var options = {
      'host': statusAPIURL.host,
      'path': statusAPIURL.path.replace('%7B/sha%7D', '?sha='.concat(push.payload.ref)),
      'method': 'GET',
      'headers' : {
        'Authorization' : 'token ' + config.github.accessToken,
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    var statusAPIRequest = https.request(options, function(statusAPIResponse) {
      var responseBodyStr = '';
      logger.debug('gitHubAPI.server.controller.setImpersonationPullRequestStatus - HTTP target : ' + options.path);
      logger.debug('gitHubAPI.server.controller.setImpersonationPullRequestStatus - HTTP status : ' + statusAPIResponse.statusCode);
      logger.debug('gitHubAPI.server.controller.setImpersonationPullRequestStatus - HTTP headers', statusAPIResponse.headers);

      statusAPIResponse.setEncoding('utf8');

      statusAPIResponse.on('data', function (chunk) {
        responseBodyStr = responseBodyStr.concat(chunk);
      });

      statusAPIResponse.on('end', function() {
        var commitArray = JSON.parse(responseBodyStr);
        var idArray = [];
        for(var commitIndex in commitArray) {
          idArray.push(commitArray[commitIndex].sha);
        }
        logger.debug('gitHubAPI.server.controller.setImpersonationPullRequestStatus - Commit IDs ' + idArray);
        //Got my arrays, now I need to check wheter one of those SHA was spoofed
        //TODO : call aggregation framework to aggregate the status

      });
    });

    statusAPIRequest.on('error', function(e) {
      logger.error('gitHubAPI.server.controller.setImpersonationPullRequestStatus - Problem retrieving commit status on ' + push.payload.ref+ ' : ' + e.message);
    });

    statusAPIRequest.end();

  }
}

/***
 * Processing each commit within a Push.
 * Using promises so the pull request status is not set until after each commit has been processed.
 ***/
function processCommits(push) {
  return new Promise(function(fulfill, reject) {
    var pusher = push.payload.pusher;
    var commits = push.payload.commits;
    var statusAPIURL = url.parse(push.payload.repository.statuses_url);


    var foundSpoofing = false;
    var commitsRemainingToProcess = commits.length;

    // Checking individual commits within this Push event
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

      //Comparing pusher email with commiter email
      if(commits[commitCounter].committer.email !== pusher.email) {
        foundSpoofing = true;
        setImpersonationCommitStatus(push, options, commitCounter, true).then(commitProcessed(--commitsRemainingToProcess, foundSpoofing, fulfill));
      } else {
        setImpersonationCommitStatus(push, options, commitCounter, false).then(commitProcessed(--commitsRemainingToProcess, foundSpoofing, fulfill));
      }
    }
  });
}

/***
 * Checking is all commits have been processed before marking the promised as fulfilled.
 ***/
function commitProcessed(commitsRemainingToProcess, foundSpoofing, fulfill) {
  logger.debug('gitHubAPI.server.controller.commitProcessed - Commits remaining to process : ' + commitsRemainingToProcess);
  if(commitsRemainingToProcess === 0) {
    fulfill(foundSpoofing);
  }
}

/***
 * A Push event was recieved *
 ***/
exports.pushValidator = function (req, res) {
  var push = new Push();
  push.payload = req.body;

  logger.debug('Recieving a push event', push.payload);

  // Persisting this Push event in the DB
  push.save(function(err) {
    if (err) {
      logger.error(err);
      return res.send(400, {'message' : err });
    } else {
      processCommits(push).then(function(foundSpoofing) {
        logger.debug('gitHubAPI.server.controller.pushValidator - All commits have been processed');
        setImpersonationPullRequestStatus(push, foundSpoofing);
        return res.status(200).send({'message' : 'OK' });
    });
    }
  });

};

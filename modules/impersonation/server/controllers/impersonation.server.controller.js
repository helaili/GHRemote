'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Push = mongoose.model('Push'),
  Commit = mongoose.model('Commit'),
  User = mongoose.model('User'),
	url = require('url'),
	https = require('https'),
  querystring = require('querystring'),
  config = require(path.resolve('./config/config')),
  winston = require('winston'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var host = null;

winston.loggers.add('Impersonation', {
  console: {
    level: config.winston.Impersonation.console.level,
    colorize: true,
    label: config.winston.Impersonation.label
  },
  file: {
    level: config.winston.Impersonation.file.level,
    filename: config.winston.Impersonation.file.filename,
    label: config.winston.Impersonation.label
  }
});

 var logger = winston.loggers.get('Impersonation');


/***
 * Injecting a sha in the URL retrieved from an API call reponse.
 * Seems like '{' and '}' are different on Unix and Mac
 ***/
function formatCommitsAPIURLPath(urlStr, value) {
  return urlStr.replace('%7B/sha%7D', '?sha='.concat(value)).replace('{/sha}', '?sha='.concat(value));
}

/***
 * Injecting a sha in the URL retrieved from an API call reponse.
 * Seems like '{' and '}' are different on Unix and Mac
 ***/
function formatStatusAPIURLPath(urlStr, value) {
  return urlStr.replace('%7Bsha%7D',value).replace('{sha}', value);
}

/***
 * Checking the status of one commit
 ***/
function setImpersonationCommitStatus(push, options, commitIndex, foundSpoofing) {
  return new Promise(function(fulfill, reject) {
    var postData = {};

    if(foundSpoofing) {
      postData = {
        'state': 'failure',
        'target_url': 'http://'.concat(host).concat('/impersonation/commit/').concat(push.payload.commits[commitIndex].id),
        "description": "Spoofed commit",
        "context": "security/impersonation/commit"
      };
    } else {
      postData = {
        "state": "success",
        "target_url": 'http://'.concat(host).concat('/impersonation/commit/').concat(push.payload.commits[commitIndex].id),
        "description": "Clean commit",
        "context": "security/impersonation/commit"
      };
    }

    var statusAPIRequest = https.request(options, function(statusAPIResponse) {
      logger.debug('impersonation.server.controller.setImpersonationCommitStatus - HTTP target : ' + options.path);
      logger.debug('impersonation.server.controller.setImpersonationCommitStatus - HTTP status : ' + statusAPIResponse.statusCode);
      logger.debug('impersonation.server.controller.setImpersonationCommitStatus - HTTP headers', statusAPIResponse.headers);

      statusAPIResponse.setEncoding('utf8');

      statusAPIResponse.on('data', function (chunk) {

      });

      statusAPIResponse.on('end', function() {
        logger.debug('impersonation.server.controller.setImpersonationCommitStatus - Saving commit', push.payload.commits[commitIndex]);
        var commit = new Commit(push.payload.commits[commitIndex]);
        commit.pusher = push.payload.pusher;
        commit.repo = push.payload.repository.name;
        commit.owner =  push.payload.repository.owner.name;
        commit.spoofed = foundSpoofing;

        commit.save(function(err) {
          if (err) {
            logger.error('impersonation.server.controller.setImpersonationCommitStatus - Failed saving commit : ' + err);
            reject(foundSpoofing);
          } else {
            logger.debug('impersonation.server.controller.setImpersonationCommitStatus - Promise is fulfilled');
            fulfill(foundSpoofing);
          }
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
            logger.debug('impersonation.server.controller.setImpersonationCommitStatus - Persisted the commit report event', res.result);
          }
        });
        */

      });


    });

    statusAPIRequest.on('error', function(e) {
      logger.error('impersonation.server.controller.setImpersonationCommitStatus - Problem sending back impersonation commit status : ' + e.message);
      reject(foundSpoofing);
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
function setImpersonationPullRequestStatus(user, push, foundSpoofing) {
  if(!foundSpoofing) {
    //No spoofing in the last push, so need to go back in time.
    //Leveraging the API to retrieve the commit ids, so we don't rely on commits in the DB which migth have been squashed or removed
    var commitsAPIURL = url.parse(push.payload.repository.commits_url);

    var options = {
      'host': commitsAPIURL.host,
      'path': formatCommitsAPIURLPath(commitsAPIURL.path, push.payload.ref),
      'method': 'GET',
      'headers' : {
        'Authorization' : 'token ' + user.providerData.accessToken,
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    var statusAPIRequest = https.request(options, function(statusAPIResponse) {
      var responseBodyStr = '';
      logger.debug('impersonation.server.controller.setImpersonationPullRequestStatus - HTTP target : ' + options.path);
      logger.debug('impersonation.server.controller.setImpersonationPullRequestStatus - HTTP status : ' + statusAPIResponse.statusCode);
      logger.debug('impersonation.server.controller.setImpersonationPullRequestStatus - HTTP headers', statusAPIResponse.headers);

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
        logger.debug('impersonation.server.controller.setImpersonationPullRequestStatus - Commit IDs ' + idArray);

        //Got my array of ids, now I need to check wheter one of those SHA was spoofed
        Commit.aggregate([{'$match' : {'id' : {'$in':  idArray}}}, {'$group' : {'_id': null, 'spoofedCount' : {'$sum' : {'$cond' : ['$spoofed', 1, 0]}}}}], function(err, result) {
          if (err) {
            logger.error('impersonation.server.controller.setImpersonationPullRequestStatus - Problem retrieving the number of spoofed commits on this Pull Request', err);
            //We should then mark the PR spoofed?
            sendImpersonationPullRequestStatus(user, push, true);
          } else {
            logger.debug('impersonation.server.controller.setImpersonationPullRequestStatus - Retrieved spoofed commit count', result);

            if(result && result[0] && result[0].spoofedCount) {
              if(result[0].spoofedCount > 0) {
                logger.debug('impersonation.server.controller.setImpersonationPullRequestStatus - Pull Request is spoofed');
                sendImpersonationPullRequestStatus(user, push, true);
              } else {
                logger.debug('impersonation.server.controller.setImpersonationPullRequestStatus - Pull Request is clean');
                sendImpersonationPullRequestStatus(user, push, false);
              }
            } else {
              sendImpersonationPullRequestStatus(user, push, true);
            }
          }
        });
      });
    });

    statusAPIRequest.on('error', function(e) {
      logger.error('impersonation.server.controller.setImpersonationPullRequestStatus - Problem retrieving commit status on ' + push.payload.ref+ ' : ' + e.message);
    });

    statusAPIRequest.end();

  } else {
    //No need to check anything as the a commit in the push is spoofed
    sendImpersonationPullRequestStatus(user, push, true);
  }
}

/***
 * Does the actual send of status for the PR (on the last commit) through HTTP POST
 ***/
function sendImpersonationPullRequestStatus(user, push, foundSpoofing) {
  var statusAPIURL = url.parse(push.payload.repository.statuses_url);

  var sha =  push.payload.commits[push.payload.commits.length-1].id;

  //Marking the last commit as spoofed or clean
  var options = {
    'host': statusAPIURL.host,
    'path': formatStatusAPIURLPath(statusAPIURL.path, sha),
    'method': 'POST',
    'headers' : {
      'Authorization' : 'token ' + user.providerData.accessToken,
      'Accept': 'application/vnd.github.v3+json'
    }
  };

  var commitsAPIURL = url.parse(push.payload.repository.commits_url);
  var commitsAPIURLParam = encodeURIComponent('https://'.concat(commitsAPIURL.host).concat(formatCommitsAPIURLPath(commitsAPIURL.path, push.payload.ref)));
  var postData = {
    'target_url': 'http://'.concat(host).concat('/impersonation/pullRequest?commitsAPIURL=').concat(commitsAPIURLParam),
    'context': 'security/impersonation/pullRequest'
  };


  if(foundSpoofing) {
    postData.state =  'failure';
    postData.description = 'Spoofed Pull Request';
  } else {
    postData.state = 'success';
    postData.description = 'Clean Pull Request';
  }

  var statusAPIRequest = https.request(options, function(statusAPIResponse) {
    logger.debug('impersonation.server.controller.sendImpersonationPullRequestStatus - HTTP target : ' + options.path);
    logger.debug('impersonation.server.controller.sendImpersonationPullRequestStatus - HTTP status : ' + statusAPIResponse.statusCode);
    logger.debug('impersonation.server.controller.sendImpersonationPullRequestStatus - HTTP headers', statusAPIResponse.headers);

    statusAPIResponse.setEncoding('utf8');

    statusAPIResponse.on('data', function (chunk) {

    });

    statusAPIResponse.on('end', function() {
      logger.debug('impersonation.server.controller.sendImpersonationPullRequestStatus - Status sent');
    });
  });

  statusAPIRequest.on('error', function(e) {
    logger.error('impersonation.server.controller.sendImpersonationPullRequestStatus - Problem sending back impersonation PR status : ' + e.message);
  });

  // write data to request body
  statusAPIRequest.write(JSON.stringify(postData));
  statusAPIRequest.end();
}

/***
 * Processing each commit within a Push.
 * Using promises so the pull request status is not set until after each commit has been processed.
 ***/
function processCommits(user, push) {
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
        'path': formatStatusAPIURLPath(statusAPIURL.path, commits[commitCounter].id),
        'method': 'POST',
        'headers' : {
          'Authorization' : 'token ' + user.providerData.accessToken,
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      var postData = {};

      //Comparing pusher email with commiter email
      if(commits[commitCounter].committer.email !== pusher.email) {
        foundSpoofing = true;
        setImpersonationCommitStatus(user, push, options, commitCounter, true).then(commitProcessed(--commitsRemainingToProcess, foundSpoofing, fulfill));
      } else {
        setImpersonationCommitStatus(user, push, options, commitCounter, false).then(commitProcessed(--commitsRemainingToProcess, foundSpoofing, fulfill));
      }
    }
  });
}

/***
 * Checking is all commits have been processed before marking the promised as fulfilled.
 ***/
function commitProcessed(commitsRemainingToProcess, foundSpoofing, fulfill) {
  logger.debug('impersonation.server.controller.commitProcessed - Commits remaining to process : ' + commitsRemainingToProcess);
  if(commitsRemainingToProcess === 0) {
    fulfill(foundSpoofing);
  }
}

/***
 * A Push event was recieved *
 ***/
exports.pushValidator = function (req, res) {
  if(req.body.zen) {
    // Ping event
    return res.status(200).send({'message' : 'I am zen too' });
  }

  var user = req.profile;

  var push = new Push();
  push.payload = req.body;

  if(!host) {
    host = req.headers.host;
  }

  logger.debug('Recieving a push event', push.payload);

  // Persisting this Push event in the DB
  push.save(function(err) {
    if (err) {
      logger.error(err);
      return res.send(400, {'message' : err });
    } else {
      processCommits(user, push).then(function(foundSpoofing) {
        logger.debug('impersonation.server.controller.pushValidator - All commits have been processed');
        setImpersonationPullRequestStatus(user, push, foundSpoofing);
        return res.status(200).send({'message' : 'OK' });
      });
    }
  });
};

/***
 * Retrieve the details for one Commit
 ***/

exports.getCommit = function (req, res) {
  logger.debug('impersonation.server.controller.getCommitWith - Request for a commit', req.body);
  Commit.findOne({'id' : req.body.sha}, function (err, doc) {
    if(err) {
      logger.error('impersonation.server.controller.getCommit - Error retrieving commit', err);
      return res.status(400).send({'message' : err });
    } else {
      logger.debug('impersonation.server.controller.getCommit - Found commit');
      return res.status(200).send(doc);
    }
  });
};

/***
 * Retrieve the details for every Commit of a pull request
 ***/

exports.getPullRequestCommits = function (req, res) {
  logger.debug('impersonation.server.controller.getPullRequestCommitsWithPusher - Request for commits of a Pull Request', req.body);

  var commitsAPIURL = url.parse(req.body.commitsAPIURL);



  var options = {
    'host': commitsAPIURL.host,
    'path': commitsAPIURL.path,
    'method': 'GET',
    'headers' : {
      'Authorization' : 'token ' + config.github.accessToken,
      'Accept': 'application/vnd.github.v3+json'
    }
  };

  var statusAPIRequest = https.request(options, function(statusAPIResponse) {
    var responseBodyStr = '';
    logger.debug('impersonation.server.controller.getPullRequestCommitsWithPusher - HTTP target : ' + options.path);
    logger.debug('impersonation.server.controller.getPullRequestCommitsWithPusher - HTTP status : ' + statusAPIResponse.statusCode);
    logger.debug('impersonation.server.controller.getPullRequestCommitsWithPusher - HTTP headers', statusAPIResponse.headers);

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
      logger.debug('impersonation.server.controller.getPullRequestCommitsWithPusher - Commit IDs ' + idArray);

      //Got my array of ids, now I need to check wheter one of those SHA was spoofed
      Commit.find({'id' : {'$in':  idArray}}, function(err, result) {
        if (err) {
          logger.error('impersonation.server.controller.getPullRequestCommitsWithPusher - Problem retrieving the commits on this Pull Request', err);
          return res.status(400).send({'message' : err });
        } else {
          logger.debug('impersonation.server.controller.getPullRequestCommitsWithPusher - Retrieved ' + result.length + ' commits.');
          return res.status(200).send(result);
        }
      });
    });
  });

  statusAPIRequest.on('error', function(e) {
    logger.error('impersonation.server.controller.getPullRequestCommitsWithPusher - Problem retrieving commit status on ' + commitsAPIURL, e);
  });

  statusAPIRequest.end();
};

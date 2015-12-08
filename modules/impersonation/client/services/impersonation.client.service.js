'use strict';

//Articles service used for communicating with the impersonation REST endpoints
angular.module('impersonation').factory('ImpersonationServices', ['$resource',
  function ($resource) {
    return $resource('api/impersonation', {}, {
      getCommit : {
        method : 'POST',
      	url : 'api/impersonation/getCommit'
      },
      getPullRequestCommits : {
        method : 'POST',
      	url : 'api/impersonation/getPullRequestCommits',
        isArray: true
      }
    });
  }
]);

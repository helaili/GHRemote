'use strict';

//Articles service used for communicating with the gitHubAPI REST endpoints
angular.module('gitHubAPI').factory('GitHubAPIServices', ['$resource',
  function ($resource) {
    return $resource('api/gitHubAPI', {}, {
      call: {
        method: 'POST'
      }
    });
  }
]);

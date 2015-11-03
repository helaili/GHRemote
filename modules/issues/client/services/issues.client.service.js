'use strict';

//Issues service used for communicating with the issues REST endpoints
angular.module('issues').factory('Issues', ['$resource',
  function ($resource) {
    return $resource('api/issues/:issueId', {
      issueId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      read : {
        method : 'POST',
      	url : 'api/issues/read'
      }
    });
  }
]);

'use strict';

angular.module('deployment').factory('DeploymentServices', ['$resource',
  function ($resource) {
    return $resource('api/deployment', {}, {
      create : {
        method : 'POST',
      	url : 'api/deployment/create'
      },
      list : {
        method : 'POST',
      	url : 'api/deployment/list',
        isArray: true
      },
      status  : {
        method : 'POST',
      	url : 'api/deployment/status',
        isArray: true
      }
    });
  }
]);

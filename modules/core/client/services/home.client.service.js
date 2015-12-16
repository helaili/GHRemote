'use strict';

//Articles service used for communicating with the home REST endpoints
angular.module('core').factory('HomeServices', ['$resource',
  function ($resource) {
    return $resource('api/home', {}, {
      getOrganizations : {
        method : 'POST',
      	url : 'api/home/getOrganizations',
        isArray: true
      },
      getRepositories : {
        method : 'POST',
      	url : 'api/home/getRepositories',
        isArray: true
      },
      addWebhook : {
        method : 'POST',
      	url : 'api/home/addWebhook'
      }
    });
  }
]);

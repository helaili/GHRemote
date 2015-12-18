'use strict';

// Setting up route
angular.module('gitHubAPI').config(['$stateProvider',
  function ($stateProvider) {
    // GitHubAPI state routing
    $stateProvider
      .state('gitHubAPI', {
        abstract: true,
        url: '/gitHubAPI',
        template: '<ui-view/>'
      })
      .state('gitHubAPI.call', {
        url: '',
        templateUrl: 'modules/gitHubAPI/client/views/call-gitHubAPI.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

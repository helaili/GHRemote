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
      .state('gitHubAPI.list', {
        url: '',
        templateUrl: 'modules/gitHubAPI/client/views/list-gitHubAPI.client.view.html'
      })
      .state('gitHubAPI.call', {
        url: '/call',
        templateUrl: 'modules/gitHubAPI/client/views/call-gitHubAPI.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

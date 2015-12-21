'use strict';

// Setting up route
angular.module('deployment').config(['$stateProvider',
  function ($stateProvider) {
    // GitHubAPI state routing
    $stateProvider
      .state('deployment', {
        abstract: true,
        url: '/deployment',
        template: '<ui-view/>'
      })
      .state('deployment.create', {
        url: '',
        templateUrl: 'modules/deployment/client/views/create-deployment.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('deployment.list', {
        url: '',
        templateUrl: 'modules/deployment/client/views/list-deployment.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

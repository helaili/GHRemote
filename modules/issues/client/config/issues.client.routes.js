'use strict';

// Setting up route
angular.module('issues').config(['$stateProvider',
  function ($stateProvider) {
    // issues state routing
    $stateProvider
      .state('issues', {
        abstract: true,
        url: '/issues',
        template: '<ui-view/>'
      })
      .state('issues.list', {
        url: '',
        templateUrl: 'modules/issues/client/views/list-issues.client.view.html'
      })
      .state('issues.create', {
        url: '/create',
        templateUrl: 'modules/issues/client/views/create-issue.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('issues.view', {
        url: '/:issueId',
        templateUrl: 'modules/issues/client/views/view-issue.client.view.html'
      })
      .state('issues.edit', {
        url: '/:issueId/edit',
        templateUrl: 'modules/issues/client/views/edit-issue.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

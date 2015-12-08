'use strict';

// Setting up route
angular.module('impersonation').config(['$stateProvider',
  function ($stateProvider) {
    // impersonation state routing
    $stateProvider
      .state('impersonation', {
        abstract: true,
        url: '/impersonation',
        template: '<ui-view/>'
      })
      .state('impersonation.commit', {
        url: '/commit/{sha}',
        templateUrl: 'modules/impersonation/client/views/commit-impersonation.client.view.html'
      })
      .state('impersonation.pullRequest', {
        url: '/pullRequest?commitsAPIURL',
        templateUrl: 'modules/impersonation/client/views/pullRequest-impersonation.client.view.html'
      });
  }
]);

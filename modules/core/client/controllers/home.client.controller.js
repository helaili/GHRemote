'use strict';

angular.module('core').controller('HomeController', ['$scope', '$http', '$filter', 'Authentication', 'HomeServices',
  function ($scope, $http, $filter, Authentication, HomeServices) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    /*$scope.webhookList = [
      { 'label': 'Impersonation Checker',
        'name' : 'web',
        'active': true,
        'events': ['push', 'pull_request'],
        'config': {
          'url': 'http://example.com/webhook',
          'content_type': 'json'
        }
      },
      { 'label': 'Deployment Orchestrator',
        'name' : 'web',
        'active': true,
        'events': ['deploy'],
        'config': {
          'url': 'http://example.com/webhook',
          'content_type': 'json'
        }
      }];*/
    HomeServices.getWebhooks(function(response) {
        $scope.webhookList = response;
        $scope.webhookSelection = $scope.webhookList[0];
    });



    $scope.organizationsPromise = undefined;
    $scope.repositoriesPromise = undefined;

    $scope.getRepositories = function(filterValue) {
      if(!$scope.repositoriesPromise) {
        // Retrieve the repositories from the server only once
        $scope.repositoriesPromise = HomeServices.getRepositories({});
      }
      // Filtering through the retrieved repos as the user types
      return $scope.repositoriesPromise.$promise.then(function(results) {
        return $filter('attributeValueContainsFilter')(results, 'full_name', filterValue);
      });
    };

    $scope.getOrganizations = function(filterValue) {
      if(!$scope.organizationsPromise) {
        // Retrieve the organizations from the server only once
        $scope.organizationsPromise = HomeServices.getOrganizations({});
      }
      // Filtering through the retrieved orgs as the user types
      return $scope.organizationsPromise.$promise.then(function(results) {
        return $filter('attributeValueContainsFilter')(results, 'login', filterValue);
      });
    };

    $scope.addWebhook = function(target, type) {
      //Make sure we have a selection in the dropdown and not a partial string
      if(target &&  typeof target === 'object') {
        var data = {
          'webhook' : $scope.webhookSelection,
          'targetType' : type,
          'target' : target
        };

        HomeServices.addWebhook(data, function(response) {
            return response;
        });
      }
    };
  }
]);

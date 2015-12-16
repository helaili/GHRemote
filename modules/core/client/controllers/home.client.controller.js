'use strict';

angular.module('core').controller('HomeController', ['$scope', '$http', '$filter', 'Authentication', 'HomeServices',
  function ($scope, $http, $filter, Authentication, HomeServices) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.webhookSelection = {'id' : '1', 'name' : 'Impersonation checker'};
    $scope.webhookList = [
      {'id' : '1', 'name' : 'Impersonation checker'},
      {'id' : '2', 'name' : 'Deployment orchestrator'}];

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

    $scope.addWebhookToOrg = function(org) {
      //Make sure we have a selection in the dropdown and not a partial string 
      if(org &&  typeof org === 'object') {
        var data = {
          'webhook' : $scope.webhookSelection,
          'targetType' : 'org',
          'target' : org
        };

        HomeServices.addWebhook(data, function(response) {

        });
      }
    };
  }
]);

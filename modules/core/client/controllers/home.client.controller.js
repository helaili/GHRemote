'use strict';

angular.module('core').controller('HomeController', ['$scope', '$http', '$filter', 'Authentication', 'HomeServices',
  function ($scope, $http, $filter, Authentication, HomeServices) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.data = {};

    HomeServices.getWebhooks(function(response) {
        $scope.webhookList = response;
        $scope.data.webhookSelection = $scope.webhookList[0];
    });


    $scope.errorMessage = undefined;
    $scope.successMessage = undefined;

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
      $scope.errorMessage = undefined;
      $scope.successMessage = undefined;
      //Make sure we have a selection in the dropdown and not a partial string
      if(target &&  typeof target === 'object') {
        var data = {
          'webhook' : $scope.data.webhookSelection,
          'targetType' : type,
          'target' : target
        };

        HomeServices.addWebhook(data, function(response) {
          if(response.id) {
            //webhook deployment succeeded
            $scope.successMessage = 'Sweet success!';
          } else {
            $scope.errorMessage = '';

            if(response.errors) {
              for(var errorIndex = 0; errorIndex < response.errors.length; errorIndex++) {
                //console.log(response.errors[errorIndex].message);
                $scope.errorMessage = $scope.errorMessage.concat(response.errors[errorIndex].message).concat(' ');
              }
            } else {
              $scope.errorMessage = 'Unknown error';
            }
          }
        });
      }
    };
  }
]);

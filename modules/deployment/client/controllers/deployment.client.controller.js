'use strict';

// GitHubAPI controller
angular.module('deployment').controller('DeploymentController', ['$scope', '$stateParams', '$location', '$filter', 'Authentication', 'DeploymentServices', 'HomeServices',
  function ($scope, $stateParams, $location, $filter, Authentication, DeploymentServices, HomeServices) {
    $scope.authentication = Authentication;

    $scope.repositoriesPromise = undefined;
    $scope.request = {'auto_merge' : true};

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

    // Create new GitHubAPI
    $scope.createDeployment = function (isValid) {
      $scope.error = null;
      $scope.success = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'createDeploymentForm');
        return false;
      }

      $scope.request.repository = $scope.asyncRepositorySelected;

      if($scope.request.required_contexts) {
        $scope.request.required_contexts = $scope.required_contexts_str.split(',');
      }

      DeploymentServices.create($scope.request, function(response) {
        if(response.statusCode - 200 <= 99) {
          $scope.success = 'Succesfully requested task ' + response.task + ' in environment ' + response.environment;
        } else {
          $scope.error = response.message;
        }
      }, function(error) {
        //console.log(error);
      });

    };

    $scope.listDeployment = function () {
      DeploymentServices.list($scope.asyncRepositorySelected, function(response) {
        var deployments = response;
        for(var deploymentIndex = 0; deploymentIndex < deployments.length; deploymentIndex++) {
          //Need to encode the URL otherwise angular is getting confused and calls the controller twice
          deployments[deploymentIndex].statuses_url_str = encodeURIComponent(deployments[deploymentIndex].statuses_url);
        }
        $scope.deployments = deployments;

      }, function(error) {
        //console.log(error);
      });
    };

    $scope.getDeploymentStatus = function() {
      DeploymentServices.status({'deploymentAPIURL' : $stateParams.deploymentAPIURL}, function(response) {
        $scope.statuses = response;
        console.log(response);
      });
    };
  }
]);

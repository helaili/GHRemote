'use strict';

// GitHubAPI controller
angular.module('gitHubAPI').controller('GitHubAPIController', ['$scope', '$stateParams', '$location', 'Authentication', 'GitHubAPIServices',
  function ($scope, $stateParams, $location, Authentication, GitHubAPIServices) {
    $scope.authentication = Authentication;
    $scope.endpoint = "/api/v3/user/orgs";

    // Create new GitHubAPI
    $scope.call = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'gitHubAPIForm');
        return false;
      }

      // Create new Article object
      var gitHubAPIServices = new GitHubAPIServices({
        endpoint: this.endpoint
      });

      gitHubAPIServices.$call(function (response) {
        $scope.callResult = JSON.parse(response.callResult);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });

    };

    // Find a list of GitHubAPI
    $scope.list = function () {

    };

  }
]);

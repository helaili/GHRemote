'use strict';

// Articles controller
angular.module('gitHubAPI').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication',
  function ($scope, $stateParams, $location, Authentication) {
    $scope.authentication = Authentication;

    // Create new GitHubAPI
    $scope.call = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'gitHubAPIForm');

        return false;
      }

    };

    // Find a list of GitHubAPI
    $scope.list = function () {
      
    };

  }
]);

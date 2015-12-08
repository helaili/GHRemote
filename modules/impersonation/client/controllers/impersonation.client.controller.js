'use strict';

// GitHubAPI controller
angular.module('impersonation').controller('ImpersonationController', ['$scope', '$stateParams', '$location', 'Authentication', 'ImpersonationServices',
  function ($scope, $stateParams, $location, Authentication, ImpersonationServices) {
    $scope.authentication = Authentication;
    $scope.endpoint = "/api/v3/user/orgs";


    $scope.commitStatus = function () {
      ImpersonationServices.getCommit({'sha' : $stateParams.sha}, function(response) {
        $scope.commit = response;
      });
    };

    $scope.pullRequestStatus = function () {
      ImpersonationServices.getPullRequestCommits({'commitsAPIURL' : $stateParams.commitsAPIURL}, function(response) {
        $scope.commits = response;
      });
    };

  }
]);

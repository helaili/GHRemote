'use strict';

// Issues controller
angular.module('issues').controller('IssuesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Issues',
  function ($scope, $stateParams, $location, Authentication, Issues) {
    $scope.authentication = Authentication;

    // Create new Issue
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'issueForm');

        return false;
      }

      // Create new Issue object
      var issue = new Issues({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      issue.$save(function (response) {
        $location.path('issues/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Issue
    $scope.remove = function (issue) {
      if (issue) {
        issue.$remove();

        for (var i in $scope.issues) {
          if ($scope.issues[i] === issue) {
            $scope.issues.splice(i, 1);
          }
        }
      } else {
        $scope.issue.$remove(function () {
          $location.path('issues');
        });
      }
    };

    // Update existing Issue
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'issueForm');

        return false;
      }

      var issue = $scope.issue;

      issue.$update(function () {
        $location.path('issues/' + issue._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Issues
    $scope.find = function () {
      $scope.issues = Issues.query();
    };

    // Find existing Issue
    $scope.findOne = function () {
      $scope.issue = Issues.get({
        issueId: $stateParams.issueId
      });
    };
  }
]);

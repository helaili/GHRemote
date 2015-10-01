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

    function mergeIssues(newIssues, status) {
      if(!$scope.issues) {
        $scope.issues = newIssues;
      } else {
        var combinedIssueArray = $scope.issues;

        /*
        //Getting the list of current issues
        for(var counter = 0; counter < combinedIssueArray.length; counter++){
          if(issueIds.indexOf(combinedIssueArray[counter].id) < 0) {
            issueIds.push(combinedIssueArray[counter].id);
          }
        }
        */

        //Inserting new issues
        for(var counter = 0; counter < newIssues.length; counter++){
          $scope.issueStatus[status][newIssues[counter].id] = true;

          if($scope.issueIds.indexOf(newIssues[counter].id) < 0) {
            $scope.issueIds.push(newIssues[counter].id);
            combinedIssueArray.push(newIssues[counter]);
          }
        }

        combinedIssueArray.sort(function(a, b) {
          return Date(a.updated_at) - Date(b.updated_at);
        });

        console.log($scope.issueStatus);
        $scope.issues = combinedIssueArray;
      }
    };

    // Find a list of Issues
    $scope.find = function () {
      $scope.issueIds = [];
      $scope.issues = [];
      $scope.issueStatus = {
        'mentioned' : {},
        'created' : {},
        'assigned' : {}
      };


      Issues.query({
        filter: 'created'
      }, function(issues) {
        mergeIssues(issues, 'created');

        Issues.query({
          filter: 'assigned'
        }, function(issues) {
          mergeIssues(issues, 'assigned');

          Issues.query({
            filter: 'mentioned'
          }, function(issues) {
            mergeIssues(issues, 'mentioned');
          });
        });

      });




    };

    // Find existing Issue
    $scope.findOne = function () {
      $scope.issue = Issues.get({
        issueId: $stateParams.issueId
      });
    };
  }
]);

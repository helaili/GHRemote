'use strict';

// Issues controller
angular.module('issues').controller('IssuesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Issues',
  function ($scope, $stateParams, $location, Authentication, Issues) {
    $scope.authentication = Authentication;
    $scope.selectedFilter = 0;
    $scope.filters = [
      {'label' : 'My issues', type : 'myIssues'},
      {'label' : 'Created', type : 'created'},
      {'label' : 'Assigned', type : 'assigned'},
      {'label' : 'Mentioned', type : 'mentioned'}
    ];


    $scope.selectFilter = function(filterId) {
        $scope.selectedFilter = filterId;
        $scope.find($scope.filters[filterId]);
    };



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
      //Inserting new issues
      for(var counter = 0; counter < newIssues.length; counter++){
        $scope.issueStatus[status][newIssues[counter].id] = true;

        if($scope.issueIds.indexOf(newIssues[counter].id) < 0) {
          $scope.issueIds.push(newIssues[counter].id);
          $scope.issues.push(newIssues[counter]);
        }
      }

      $scope.issues.sort(function(a, b) {
        return Date(a.updated_at) - Date(b.updated_at);
      });
    }

    // Find one single list of Issues
    $scope.findIssues = function(filter) {
      Issues.query({
        'filter': filter
      }, function(issues) {
        mergeIssues(issues, filter);
      });
    };


    // Find a list of list of Issues
    $scope.find = function (filter) {
      $scope.issueIds = [];
      $scope.issues = [];
      $scope.issueStatus = {
        'mentioned' : {},
        'created' : {},
        'assigned' : {}
      };

      var filterIds = [];

      if(!filter || filter.type === 'myIssues') {
        filterIds = ['created', 'assigned', 'mentioned'];
      } else {
        filterIds.push(filter.type);
      }

      for(var counter = 0; counter < filterIds.length; counter++) {
        $scope.findIssues(filterIds[counter]);
      }
    };


    // Find existing Issue
    $scope.getIssue = function () {
      $scope.repositoryName = $stateParams.repositoryName;
      $scope.repositoryOwner = $stateParams.repositoryOwner;

      $scope.issue = Issues.read({
        repositoryName : $stateParams.repositoryName,
        repositoryOwner : $stateParams.repositoryOwner,
        issueId : $stateParams.issueNumber
      }, function(response) {
        console.log(response);
      });
    };
  }
]);

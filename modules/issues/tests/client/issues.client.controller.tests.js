'use strict';

(function () {
  // Issues Controller Spec
  describe('Issues Controller Tests', function () {
    // Initialize global variables
    var IssuesController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Issues,
      mockIssue;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Issues_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Issues = _Issues_;

      // create mock issue
      mockIssue = new Issues({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Issue about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Issues controller.
      IssuesController = $controller('IssuesController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one issue object fetched from XHR', inject(function (Issues) {
      // Create a sample issues array that includes the new issue
      var sampleIssues = [mockIssue];

      // Set GET response
      $httpBackend.expectGET('api/issues').respond(sampleIssues);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.issues).toEqualData(sampleIssues);
    }));

    it('$scope.findOne() should create an array with one issue object fetched from XHR using a issueId URL parameter', inject(function (Issues) {
      // Set the URL parameter
      $stateParams.issueId = mockIssue._id;

      // Set GET response
      $httpBackend.expectGET(/api\/issues\/([0-9a-fA-F]{24})$/).respond(mockIssue);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.issue).toEqualData(mockIssue);
    }));

    describe('$scope.create()', function () {
      var sampleIssuePostData;

      beforeEach(function () {
        // Create a sample issue object
        sampleIssuePostData = new Issues({
          title: 'An Issue about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Issue about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Issues) {
        // Set POST response
        $httpBackend.expectPOST('api/issues', sampleIssuePostData).respond(mockIssue);

        // Run controller functionality
        scope.create(true);
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the issue was created
        expect($location.path.calls.mostRecent().args[0]).toBe('issues/' + mockIssue._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/issues', sampleIssuePostData).respond(400, {
          message: errorMessage
        });

        scope.create(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock issue in scope
        scope.issue = mockIssue;
      });

      it('should update a valid issue', inject(function (Issues) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/issues\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/issues/' + mockIssue._id);
      }));

      it('should set scope.error to error response message', inject(function (Issues) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/issues\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(issue)', function () {
      beforeEach(function () {
        // Create new issues array and include the issue
        scope.issues = [mockIssue, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/issues\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockIssue);
      });

      it('should send a DELETE request with a valid issueId and remove the issue from the scope', inject(function (Issues) {
        expect(scope.issues.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.issue = mockIssue;

        $httpBackend.expectDELETE(/api\/issues\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to issues', function () {
        expect($location.path).toHaveBeenCalledWith('issues');
      });
    });
  });
}());

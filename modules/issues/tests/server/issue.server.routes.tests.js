'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Issue = mongoose.model('Issue'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, issue;

/**
 * Issue routes tests
 */
describe('Issue CRUD tests', function () {
  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'password'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new issue
    user.save(function () {
      issue = {
        title: 'Issue Title',
        content: 'Issue Content'
      };

      done();
    });
  });

  it('should be able to save an issue if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new issue
        agent.post('/api/issues')
          .send(issue)
          .expect(200)
          .end(function (issueSaveErr, issueSaveRes) {
            // Handle issue save error
            if (issueSaveErr) {
              return done(issueSaveErr);
            }

            // Get a list of issues
            agent.get('/api/issues')
              .end(function (issuesGetErr, issuesGetRes) {
                // Handle issue save error
                if (issuesGetErr) {
                  return done(issuesGetErr);
                }

                // Get issues list
                var issues = issuesGetRes.body;

                // Set assertions
                (issues[0].user._id).should.equal(userId);
                (issues[0].title).should.match('Issue Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an issue if not logged in', function (done) {
    agent.post('/api/issues')
      .send(issue)
      .expect(403)
      .end(function (issueSaveErr, issueSaveRes) {
        // Call the assertion callback
        done(issueSaveErr);
      });
  });

  it('should not be able to save an issue if no title is provided', function (done) {
    // Invalidate title field
    issue.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new issue
        agent.post('/api/issues')
          .send(issue)
          .expect(400)
          .end(function (issueSaveErr, issueSaveRes) {
            // Set message assertion
            (issueSaveRes.body.message).should.match('Title cannot be blank');

            // Handle issue save error
            done(issueSaveErr);
          });
      });
  });

  it('should be able to update an issue if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new issue
        agent.post('/api/issues')
          .send(issue)
          .expect(200)
          .end(function (issueSaveErr, issueSaveRes) {
            // Handle issue save error
            if (issueSaveErr) {
              return done(issueSaveErr);
            }

            // Update issue title
            issue.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing issue
            agent.put('/api/issues/' + issueSaveRes.body._id)
              .send(issue)
              .expect(200)
              .end(function (issueUpdateErr, issueUpdateRes) {
                // Handle issue update error
                if (issueUpdateErr) {
                  return done(issueUpdateErr);
                }

                // Set assertions
                (issueUpdateRes.body._id).should.equal(issueSaveRes.body._id);
                (issueUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of issues if not signed in', function (done) {
    // Create new issue model instance
    var issueObj = new Issue(issue);

    // Save the issue
    issueObj.save(function () {
      // Request issues
      request(app).get('/api/issues')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single issue if not signed in', function (done) {
    // Create new issue model instance
    var issueObj = new Issue(issue);

    // Save the issue
    issueObj.save(function () {
      request(app).get('/api/issues/' + issueObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', issue.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single issue with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/issues/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Issue is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single issue which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent issue
    request(app).get('/api/issues/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No issue with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an issue if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new issue
        agent.post('/api/issues')
          .send(issue)
          .expect(200)
          .end(function (issueSaveErr, issueSaveRes) {
            // Handle issue save error
            if (issueSaveErr) {
              return done(issueSaveErr);
            }

            // Delete an existing issue
            agent.delete('/api/issues/' + issueSaveRes.body._id)
              .send(issue)
              .expect(200)
              .end(function (issueDeleteErr, issueDeleteRes) {
                // Handle issue error error
                if (issueDeleteErr) {
                  return done(issueDeleteErr);
                }

                // Set assertions
                (issueDeleteRes.body._id).should.equal(issueSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an issue if not signed in', function (done) {
    // Set issue user
    issue.user = user;

    // Create new issue model instance
    var issueObj = new Issue(issue);

    // Save the issue
    issueObj.save(function () {
      // Try deleting issue
      request(app).delete('/api/issues/' + issueObj._id)
        .expect(403)
        .end(function (issueDeleteErr, issueDeleteRes) {
          // Set message assertion
          (issueDeleteRes.body.message).should.match('User is not authorized');

          // Handle issue error error
          done(issueDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Issue.remove().exec(done);
    });
  });
});

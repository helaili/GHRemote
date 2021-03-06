'use strict';

var defaultEnvConfig = require('./default');

//Work with self-signed SSL Certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = {
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/mean-dev',
    options: {
      user: '',
      pass: ''
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  webhookList : [
    { 'label': 'Impersonation Checker',
      'name' : 'web',
      'active': true,
      'events': ['push'],
      'config': {
        'url': 'http://192.168.231.1:3000/api/impersonation/pushValidator',
        'content_type': 'json'
      }
    },
    { 'label': 'Deployment Manager',
      'name' : 'web',
      'active': true,
      'events': ['deployment'],
      'config': {
        'url': 'http://192.168.231.1:3000/api/deployment/deploy',
        'content_type': 'json'
      }
    }
  ],
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      //stream: 'access.log'
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'APP_ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
    clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
    callbackURL: 'http://192.168.231.1:3000/api/auth/github/callback',
    authorizationURL: 'https://octoalaindemo/login/oauth/authorize',
    tokenURL: 'https://octoalaindemo/login/oauth/access_token',
    userProfileURL : 'https://octoalaindemo/api/v3/user',
    scope : ['user', 'repo', 'notifications', 'admin:org', 'admin:org_hook'],
		githubHost: 'octoalaindemo'
  },
  paypal: {
    clientID: process.env.PAYPAL_ID || 'CLIENT_ID',
    clientSecret: process.env.PAYPAL_SECRET || 'CLIENT_SECRET',
    callbackURL: '/api/auth/paypal/callback',
    sandbox: true
  },
  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  },
  winston: {
    GitHubAPI : {
      label: 'GitHub API',
      console : {
        level : 'debug'
      },
      file: {
        level : 'info',
        filename: './ghremote.log'
      }
    },
    Impersonation : {
      label: 'Impersonation API',
      console : {
        level : 'debug'
      },
      file: {
        level : 'info',
        filename: './ghremote.log'
      }
    },
    Deployment : {
      label: 'Deployment API',
      console : {
        level : 'debug'
      },
      file: {
        level : 'info',
        filename: './ghremote.log'
      }
    },
    Home : {
      label: 'Home page',
      console : {
        level : 'debug'
      },
      file: {
        level : 'info',
        filename: './ghremote.log'
      }
    }
  },
  livereload: true,
  seedDB: process.env.MONGO_SEED || false
};

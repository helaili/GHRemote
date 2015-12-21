'use strict';

// Configuring the GitHubAPI module
angular.module('deployment').run(['Menus',
  function (Menus) {
    // Add the gitHubAPI dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Deployments',
      state: 'deployment',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown call item
    Menus.addSubMenuItem('topbar', 'deployment', {
      title: 'Request a deployment',
      state: 'deployment.create',
      roles: ['user']
    });

    Menus.addSubMenuItem('topbar', 'deployment', {
      title: 'List deployments',
      state: 'deployment.list',
      roles: ['user']
    });
  }
]);

'use strict';

// Configuring the GitHubAPI module
angular.module('gitHubAPI').run(['Menus',
  function (Menus) {
    // Add the gitHubAPI dropdown item
    Menus.addMenuItem('topbar', {
      title: 'GitHub API',
      state: 'gitHubAPI',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'gitHubAPI', {
      title: 'List GitHub API',
      state: 'gitHubAPI.list'
    });

    // Add the dropdown call item
    Menus.addSubMenuItem('topbar', 'gitHubAPI', {
      title: 'Call GitHub API',
      state: 'gitHubAPI.call',
      roles: ['user']
    });
  }
]);

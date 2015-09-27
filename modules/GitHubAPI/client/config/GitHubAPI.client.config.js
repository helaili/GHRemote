'use strict';

// Configuring the GitHubAPI module
angular.module('gitHubAPI').run(['Menus',
  function (Menus) {
    // Add the gitHubAPI dropdown item
    Menus.addMenuItem('topbar', {
      title: 'GitHubAPI',
      state: 'gitHubAPI',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'gitHubAPI', {
      title: 'List GitHubAPI',
      state: 'gitHubAPI.list'
    });

    // Add the dropdown call item
    Menus.addSubMenuItem('topbar', 'gitHubAPI', {
      title: 'Call GitHubAPI',
      state: 'gitHubAPI.call',
      roles: ['user']
    });
  }
]);

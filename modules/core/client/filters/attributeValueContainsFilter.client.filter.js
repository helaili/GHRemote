'use strict';

angular.module('core').filter('attributeValueContainsFilter', function() {

  return function(orgs, attribute, filterValue) {
    var output = [];

    for(var orgIndex = 0 ; orgIndex < orgs.length; orgIndex++) {
      if(orgs[orgIndex][attribute].toLowerCase().indexOf(filterValue.toLowerCase()) > -1) {
        output.push(orgs[orgIndex]);
      }
    }

    return output;
  };

});

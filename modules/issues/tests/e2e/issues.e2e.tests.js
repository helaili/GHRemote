'use strict';

describe('Issues E2E Tests:', function () {
  describe('Test issues page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3000/issues');
      expect(element.all(by.repeater('issue in issues')).count()).toEqual(0);
    });
  });
});

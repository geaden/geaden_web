'use strict';

describe('Geaden Web Site', function() {
  it('should redirect to /', function() {
    browser.get('/');    
  });
  it('should redirect to /edit', function() {
    browser.get('/edit')
  })
});
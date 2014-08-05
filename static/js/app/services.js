'use strict';

/** Services **/
(function () {
  var geadenServices = angular.module('geadenServices', ['ngResource']);

  geadenServices.factory('Me', ['$resource',
    function($resource){
      return $resource('/data/me.json', {}, {
        query: {method:'GET'}
      });
  }]);

  geadenServices.factory('Quote', ['$resource',
    function($resource){
      return $resource('/data/quotes.json', {}, {
        query: {method: 'GET', isArray: true}
      });
  }]);

  geadenServices.factory('Link', ['$resource',
    function($resource){
      return $resource('/links', {}, {
        query: {method: 'GET', isArray: true}
      });
  }]);

  geadenServices.factory('Skills', ['$resource',
    function($resource){
      return $resource('/skills', {}, {
        query: {method: 'GET', isArray: true}
      });
  }]);

  geadenServices.factory('Experience', ['$resource',
    function($resource) {
      return $resource('/data/experience.json', {}, {
        query: {method: 'GET', isArray: true}
      });
  }]);

  geadenServices.factory('Education', ['$resource',
    function($resource) {
      return $resource('/data/education.json', {}, {
        query: {method: 'GET', isArray: true}
      });
  }]);
})();
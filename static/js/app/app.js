'use strict';

/* App Module */

(function () {
  var app = angular.module('geaden', [
    'ngRoute',
    'geadenControllers',
    'geadenDirectives']);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'templates/me.html',
        controller: 'MyCtrl'
      }).
      when('/hoops', {
        templateUrl: 'templates/hoops.html',
        controller: 'HoopsCtrl'
      }).
      when('/goals', {
        templateUrl: 'templates/goals-list.html',
        controller: 'GoalsCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);
})();

(function () {
  var app = angular.module('geadenDirectives', []);

  app.directive('quotesCarousel', function () {
    return {
      restrict: 'E',
      templateUrl: '/templates/quotes-carousel.html',
      controller: 'QuotesCtrl'
    };
  });

  app.directive('skillsList', function () {
    return {
      restrict: 'E',
      templateUrl: '/templates/skills-list.html',
      controller: 'SkillsCtrl'
    }
  });

  app.directive('skillsEdit', function () {
    return {
      restrict: 'E',
      templateUrl: '/templates/skills-edit.html',
      controller: 'SkillsCtrl'
    }
  });

  app.directive('linksEdit', function () {
    return {
      restrict: 'E',
      templateUrl: '/templates/links-edit.html',
      controller: 'LinksCtrl'
    }
  });

  app.directive('editTabs', function () {
    return {
      restrict: 'E',
      controller: 'TabsCtrl',
      templateUrl: '/templates/skills-tabs.html'
    }
  });

  app.directive("experienceList", ['$log', '$http', function ($log, $http) {
    return {
      restrict: 'E',
      templateUrl: '/templates/experience-list.html',
      controller: 'ExperienceCtrl'
    }
  }]);

  app.directive("contactsList", function () {
    return {
      restrict: 'E',
      templateUrl: '/templates/contacts-list.html',
      controller: 'ContactsCtrl'
    }
  });

  app.directive("educationList", ['$log', '$http', function ($log, $http) {
    return {
      restrict: 'E',
      templateUrl: '/templates/education-list.html',
      controller: 'EducationCtrl'
    }
  }]);

  app.directive('goalEscape', function() {
    'use strict';

    var ESCAPE_KEY = 27;

    return function (scope, elem, attrs) {
      elem.bind('keydown', function (event) {
        if (event.keyCode === ESCAPE_KEY) {
          scope.$apply(attrs.goalEscape);
        }
      });
    };
  });

  app.directive('goalFocus', function goalFocus($timeout) {
    'use strict';

    return function (scope, elem, attrs) {
      scope.$watch(attrs.goalFocus, function (newVal) {
        if (newVal) {
          $timeout(function () {
            elem[0].focus();
          }, 0, false);
        }
      });
    };
  });
})();
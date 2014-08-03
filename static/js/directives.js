(function () {
  var app = angular.module('geaden-directives', []);

  app.directive("quotesCarousel", ['$log', '$timeout', '$http', function ($log, $timeout, $http) {
    return {
      restrict: 'E',
      templateUrl: '/templates/quotes-carousel.html',
      controller: function () {
        this.DISPLAY = 0;
        this.TRANSIT = 1;

        this.currentQuoteIndex = 0;

        this.quotes = [];

        var _this = this;

        $http.get('/data/quotes.json').success(function(data) {
          _this.quotes = data;
        });

        // Quote state, i.e. transitioning or displaying
        this.state = this.DISPLAY;

        // Currently displayed quote
        this.quote = this.quotes[this.currentQuoteIndex];

        /**
         * Selects next quote        
         */
        this.nextQuote = function () {            
          this.selectQuote(++this.currentQuoteIndex % this.quotes.length);
        }

        /**
         * Selects desired quote
         */
        this.selectQuote = function (index) { 
          this.quote = this.quotes[index];
          this.currentQuoteIndex = index;                  
        }

        /**
         * Is quote current
         * @param  {int}  index index of selected quote
         * @return {Boolean} whether quite current or not
         */
        this.isCurrent = function (index) {
          return this.currentQuoteIndex === index;
        }

        /**
         * Selects previous quote
         */
        this.prevQuote = function () {
          var up = this.currentQuoteIndex > 0;
          if (!up) {
            this.currentQuoteIndex = this.quotes.length;            
          }
          this.selectQuote(--this.currentQuoteIndex);
        }

        /**
         * Add quote
         * @param {String} author  quote author
         * @param {String} content quote content
         */
        this.addQuote = function (author, content) {
          this.quotes.push({'author': author, 'quote': content});
        };

        var _this = this;
        var looptTimeout = 5000;        

        /**
         * Loop over quotes
         */
        var quotesLoop = function() { 
          _this.nextQuote();         
          $timeout(quotesLoop, looptTimeout);
        }

        $timeout(quotesLoop, looptTimeout);
      },
      controllerAs: 'quotesCtrl'
    };
  }]);

  app.directive("skillsList", ['$log', 'toaster', '$http', function ($log, toaster, $http) {
    return {
      restrict: 'E',
      templateUrl: '/templates/skills-list.html',
      controller: function () {
        // Index of shown skills
        this.shownIdx = undefined;

        this.skills = [];

        var _this = this;

        $http.get('/data/skills.json').success(function (data) {
          _this.skills = data;
        });

        /**
         * Shows description by clicking skills title
         * @param  {int} skills index of selected skills
         */
        this.showDescription = function (skillsIdx) {
          $log.info('Show description'); 
          if (this.isShown(skillsIdx)) {
            // Hide it
            this.shownIdx = undefined;
          } else {
            this.shownIdx = skillsIdx;
          }          
        } 

        /**
         * Approves skill
         * @param  {int} skillsIdx skill index to approve
         */
        this.approve = function (skillsIdx) {
          this.skills[skillsIdx].approved++;
          toaster.pop('success', "title", "Thanks for approving " + this.skills[skillsIdx].title);
        }

        /**
         * Checks if skills is shown
         * @param  {int}  skillsIdx index of selected skills
         * @return {Boolean}        shown skills details or not
         */
        this.isShown = function (skillsIdx) {
          return this.shownIdx === skillsIdx;
        }
      },
      controllerAs: 'skillsCtrl'
    }
  }]);

  app.directive("experienceList", ['$log', '$http', function ($log, $http) {
    return {
      restrict: 'E',
      templateUrl: '/templates/experience-list.html',
      controller: function () {
        this.experienceList = [];

        var _this = this;

        $http.get('/data/experience.json').success(function (data) {
          _this.experienceList = data;
        })
      },
      controllerAs: 'experienceCtrl'
    }
  }]);

  app.directive("educationList", ['$log', '$http', function ($log, $http) {
    return {
      restrict: 'E',
      templateUrl: '/templates/education-list.html',
      controller: function () {
        this.educationList = [];

        var _this = this;

        $http.get('/data/education.json').success(function(data) {
          _this.educationList = data;
        });        
      },
      controllerAs: 'educationCtrl'
    }
  }]);

  app.directive("dialogBox", ['$log', '$document', function ($log, $document) {
    return {
      restrict: 'E',
      templateUrl: 'dialog-box.html',
      controller: function() {
        var CLOSED = 0;
        var OPENED = 1;

        this.content = undefined;
        this.state = CLOSED;

        this.open = function () {
          $log.info('Opened...');          
          this.state = OPENED;          
        };

        this.close = function () {          
          if (this.state == OPENED) {                        
            this.state = CLOSED;
            $log.info('Closed...');
          }          
        };         
      },
      controllerAs: 'dialogBoxCtrl'
    }
  }])
})();
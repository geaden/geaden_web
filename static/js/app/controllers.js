'use strict';

/* Controllers */
(function () {
  var geadenControllers = angular.module('geadenControllers', ['geadenServices', 'toaster']);

  geadenControllers.controller('MyCtrl', ['$scope', 'Me', '$log', function ($scope, Me, $log) {  
    $scope.info = Me.query();    

    $(window).scroll(function() {
      if ($(this).scrollTop() >= 100) {   // If page is scrolled more than 50px
        $('#up').fadeIn(400);               // Fade in the arrow
      } else {
        $('#up').fadeOut(400);              // Else fade out the arrow
      }
    });

    $('#up').click(function() {             // When arrow is clicked
      $('body,html').animate({
        scrollTop : 0                       // Scroll to top of body
      }, 500);
    });

    // Show content when loading finished
    Pace.once('done', function() {
      $('.content').fadeIn(1000);
      $('.content').removeClass('loading');
    });  
  }]);

  geadenControllers.controller('QuotesCtrl', [
    '$scope',
    'Quote',
    '$timeout', 
    '$log', 
    function ($scope, Quote, $timeout, $log) {   
      $scope.currentQuoteIndex = 0;

      $scope.quotes = Quote.query();    

      /**
       * Selects next quote        
       */
      $scope.nextQuote = function () {
        $scope.selectQuote(++$scope.currentQuoteIndex % $scope.quotes.length);
      }

      /**
       * Selects desired quote
       */
      $scope.selectQuote = function (index) {        
        $scope.currentQuoteIndex = index;                  
      }

      /**
       * Is quote current
       * @param  {int}  index index of selected quote
       * @return {Boolean} whether quite current or not
       */
      $scope.isCurrent = function (index) {
        return $scope.currentQuoteIndex === index;
      }

      /**
       * Selects previous quote
       */
      $scope.prevQuote = function () {
        var up = $scope.currentQuoteIndex > 0;
        if (!up) {
          $scope.currentQuoteIndex = $scope.quotes.length;            
        }
        $scope.selectQuote(--$scope.currentQuoteIndex);
      }

      /**
       * Add quote
       * @param {String} author  quote author
       * @param {String} content quote content
       */
      $scope.addQuote = function (author, content) {
        $scope.quotes.push({'author': author, 'quote': content});
      };

      var looptTimeout = 8000;        

      /**
       * Loop over quotes
       */
      var quotesLoop = function() { 
        $scope.nextQuote();         
        $timeout(quotesLoop, looptTimeout);
      }

      $timeout(quotesLoop, looptTimeout);
  }]);

  geadenControllers.controller('SkillsCtrl', [
    '$scope', 
    'Skills',
    '$http',
    'toaster', 
    '$log', function ($scope, Skills, $http, toaster, $log) {
      // Index of shown skills
      $scope.shownIdx = undefined;

      $scope.skills = Skills.query();  

      /**
       * Shows description by clicking skills title
       * @param  {int} skills index of selected skills
       */
      $scope.showDescription = function (skillsIdx) {
        $log.info('Show description'); 
        if ($scope.isShown(skillsIdx)) {
          // Hide it
          $scope.shownIdx = undefined;
        } else {
          $scope.shownIdx = skillsIdx;
        }          
      } 

      /**
       * Approves skill
       * @param  {int} skill to be approved
       */
      $scope.approve = function (skill) {
        $http.post('/skills/approve/', {_id: skill._id}).success(function() {
          toaster.pop('success', "Skill Approved!", "Thanks for approving " + skill.title);  
        });
        skill.approved += 1;        
      }

      /**
       * Checks if skills is shown
       * @param  {int}  skillsIdx index of selected skills
       * @return {Boolean}        shown skills details or not
       */
      $scope.isShown = function (skillsIdx) {
        return $scope.shownIdx === skillsIdx;
      }
  }]);

  geadenControllers.controller('EducationCtrl', [
    '$scope', 
    'Education',
    '$log', function ($scope, Education, $log) {  
      $scope.educationList = Education.query();  
  }]);

  geadenControllers.controller('ExperienceCtrl', [
    '$scope', 
    'Experience',
    '$log', function ($scope, Experience, $log) {  
      $scope.experienceList = Experience.query();  
  }]);
})();
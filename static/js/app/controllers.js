'use strict';

/* Controllers */
(function () {
  var geadenControllers = angular.module('geadenControllers', ['geadenServices', 'toaster', 'angularMoment']);

  geadenControllers.controller('MyCtrl',
    [
      '$scope',
      'Me',
      '$http',
      'moment',
      '$timeout',
      '$log',
      function ($scope, Me, $http, moment, $timeout, $log) {
        $scope.info = Me.query();            

        /**
         * Changes picture on mouse enter
         */
        $scope.changePic = function () {        
          var $myPic = $('#info img');
          if ($myPic.attr('src') === $scope.info.pic) {
            $scope.changePicTimer = $timeout(function() {
             $myPic.fadeOut(400, function() {
                var altPic = new Image();
                altPic.src = $scope.info.altPic;
                altPic.onload = function() {
                  $myPic.attr('src', this.src);
                  $myPic.fadeIn(400);
                };
              });
            }, 1000);
          }        
        };

        /**
         * Reverts picture back
         */
        $scope.revertPic = function() {      
          $timeout.cancel($scope.changePicTimer);
          $('#info img').attr('src', $scope.info.pic);
        };

        $scope.age = function () {
          var bday = new Date($scope.info.birthDay);
          return moment().diff(moment(bday), 'years');
        };

        $(window).scroll(function() {
          if ($(this).scrollTop() >= 100) {     // If page is scrolled more than 50px
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

        /**
         * Falling snow using html5
         * Legacy of http://thecodeplayer.com/walkthrough/html5-canvas-snow-effect       
         */
        var snow = function(){
          //canvas init
          var canvas = document.getElementsByTagName('canvas')[0];
          var ctx = canvas.getContext('2d');
          
          //canvas dimensions
          var W = window.innerWidth;
          var H = window.innerHeight;
          canvas.width = W;
          canvas.height = H;
          
          //snowflake particles
          var mp = 25; //max particles
          var particles = [];
          for(var i = 0; i < mp; i++) {
            particles.push({
              x: Math.random()*W, //x-coordinate
              y: Math.random()*H, //y-coordinate
              r: Math.random()*4+1, //radius
              d: Math.random()*mp //density
            });
          }
          
          //Lets draw the flakes
          function draw() {
            ctx.clearRect(0, 0, W, H);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            for (var i = 0; i < mp; i++) {
              var p = particles[i];
              ctx.moveTo(p.x, p.y);
              ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
            }
            ctx.fill();
            update();
          }
          
          //Function to move the snowflakes
          //angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
          var angle = 0;
          function update() {
            angle += 0.01;
            for(var i = 0; i < mp; i++)
            {
              var p = particles[i];
              //Updating X and Y coordinates
              //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
              //Every particle has its own density which can be used to make the downward movement different for each flake
              //Lets make it more random by adding in the radius
              p.y += Math.cos(angle+p.d) + 1 + p.r/2;
              p.x += Math.sin(angle) * 2;
              
              //Sending flakes back from the top when it exits
              //Lets make it a bit more organic and let flakes enter from the left and right also.
              if(p.x > W+5 || p.x < 0 || p.y > H)
              {
                if(i%3 > 0) //66.67% of the flakes
                {
                  particles[i] = {x: Math.random()*W, y: -10, r: p.r, d: p.d};
                }
                else
                {
                  //If the flake is exitting from the right
                  if(Math.sin(angle) > 0)
                  {
                    //Enter from the left
                    particles[i] = {x: -5, y: Math.random()*H, r: p.r, d: p.d};
                  }
                  else
                  {
                    //Enter from the right
                    particles[i] = {x: W+5, y: Math.random()*H, r: p.r, d: p.d};
                  }
                }
              }
            }
          }
          
          //animation loop
          setInterval(draw, 33);
        };

        // Show content when loading finished      
        Pace.once('done', function() {
          $('.content').fadeIn(1000);
          $('.content').removeClass('loading');
          // Let the snow start only if it's winter time
          if ([11, 0, 1].indexOf(moment().month()) !== -1) {
            $(document.body).addClass('snows', 1000, 'ease');          
            snow();
          }
          // TODO: make more fancy backgrounds
        });

        // Admin menu
        var $adminMenu = $('#nav-admin-menu');
        if ($adminMenu) {
          var adminMenuShown = false;
          $(window).mousemove(function(e) {          
            if (e.clientX < 10 && e.clientY < 100) {            
              $adminMenu.stop().animate({
                top: 0,
                opacity: 0.8
              }, 'fast', function() {
                $adminMenu.one('mouseleave touchend', function(e) {
                  $adminMenu.stop().animate({
                    top: '-50px',
                    opacity: 0
                  }, 'fast');
                  return true;
                });
              });
            }
          });
        }        
    }]);

    geadenControllers.controller('QuotesCtrl', [
      '$scope',
      'Quote',
      '$timeout', 
      '$log', 
      function ($scope, Quote, $timeout, $log) {
        var loopTimeout = 8000;
        $scope.currentQuoteIndex = 0;      

        $scope.quotes = Quote.query();    

        /**
         * Selects next quote        
         */
        $scope.nextQuote = function () {
          $scope.selectQuote(($scope.currentQuoteIndex + 1) % $scope.quotes.length, true);      
        };

        /**
         * Selects desired quote
         * @param {Integer} [index] [index of selected quote]
         * @return {Boolean} [javascript specific return]
         */
        $scope.selectQuote = function (index, isNext, isPrev) {
          var prevQuoteIndex = $scope.currentQuoteIndex;

          if (!(isNext || isPrev)) {
            isNext = $scope.currentQuoteIndex < index;
          }

          var $currentQuote = $('.quotes-carousel > li.active');
          var $nextQuote = $('.quotes-carousel > li:eq(' + index + ')');

          $currentQuote.addClass(isNext ? 'next-out' : 'prev-out');
          $nextQuote.addClass(isNext ? 'next-in' : 'prev-in');

          // Stop animation
          $nextQuote.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {          
            $(this).removeClass('next-in prev-in');
            $currentQuote.removeClass('next-out prev-out');
          });

          $scope.currentQuoteIndex = index;
          return false;
        };

        /**
         * Is quote current
         * @param  {int}  index index of selected quote
         * @return {Boolean} whether quite current or not
         */
        $scope.isCurrent = function (index) {
          return $scope.currentQuoteIndex === index;
        };

        /**
         * Selects previous quote
         */
        $scope.prevQuote = function () {
          var up = $scope.currentQuoteIndex > 0;
          if (!up) {
            $scope.currentQuoteIndex = $scope.quotes.length;            
          }
          $scope.selectQuote($scope.currentQuoteIndex - 1, false, true);
        };

        /**
         * Add quote
         * @param {String} author  quote author
         * @param {String} content quote content
         */
        $scope.addQuote = function (author, content) {
          $scope.quotes.push({'author': author, 'quote': content});
        };

        /**
         * Loop over quotes
         */
        var quotesLoop = function() { 
          $scope.nextQuote();         
          $scope.quoteLoopTimeout = $timeout(quotesLoop, loopTimeout);
        };
      
        $scope.quoteLoopTimeout = $timeout(quotesLoop, loopTimeout);
    }]);

    geadenControllers.controller('SkillsCtrl', [
      '$scope', 
      'Skills',
      'Link',
      '$http',    
      'toaster', 
      '$timeout',
      '$log', function ($scope, Skills, Link, $http, toaster, $timeout, $log) {
        // Index of shown skills
        $scope.shownIdx = undefined;

        $scope.skills = Skills.query(); 

        // New skill to be added
        $scope.skill = {links:[]};

        // New link
        $scope.link = {};

        /**
         * Shows description by clicking skills title
         * @param  {int} skills index of selected skills
         */
        $scope.showDescription = function (skillsIdx) {
          if ($scope.isShown(skillsIdx)) {
            // Hide it
            $scope.shownIdx = undefined;
          } else {
            $scope.shownIdx = skillsIdx;
          }          
        };

        /**
         * Resets current scope value
         */
        $scope.resetSkill = function() {
          $scope.skill = {links:[]};
        };

        /**
         * Adds new skill
         */
        $scope.addSkill = function(skill) {
          if (!skill._id) {
            $http.post('/skills/', {data: skill, action: 'new'})
              .success(function(data) {
                $scope.skills.push(data);
                toaster.pop('success', 'Skill added', 'Skill with id ' + data._id + ' added.');
              });                      
          } else {
            $http.post('/skills/', {data: skill, action: 'update'})
              .success(function(data) {  
                skill = data;            
                toaster.pop('success', 'Skill updated', 'Skill with id ' + data._id + ' updated.');              
            });          
          }
          $scope.skill = {links:[]};        
        };

        /**
         * Toggles available links visibility
         */
        $scope.toggleAvailableLinks = function (link) {
          link.showAvailableLinks = !link.showAvailableLinks;
          if (!link.showAvailableLinks) {
            // Clean up link object
            delete link.showAvailableLinks;
          }
        };

        /**
         * Force edit skill
         * @param  {Objct} skill  skill to edit
         */
        $scope.editSkill = function(skill) {
          $scope.skill = skill;
          $('.skill-form input')[0].focus();
        };

        /**
         * Removes skills from skills list
         * @param {Object} skill skill to be deleted
         * @parm {int} index of skill
         */
        $scope.removeSkill = function(skill, idx) {        
          $http.post('/skills/', {'_id': skill._id, 'action': 'delete'}).success(function() {
            toaster.pop('info', 'Skill removed!', 'Skill ' + skill.title + ' was removed.');
          }).error(function() {
            toaster.pop('error', 'Error', 'Error removing skill ' + skill.title);
          });
          $scope.skill = {links:[]};
          $scope.skills.splice(idx, 1);        
        };

        /**
         * Selects link from available
         * @param  {Object} link link to be selected
         * @param  {int} idx  skills links index
         */
        $scope.selectSkillLink = function(link, idx) {
          $scope.skill.links[idx] = link;
        };

        /**
         * Add new link to skill
         * @param {Object} skill skill to add link to
         */
        $scope.newSkillLink = function(skill) { 
          $scope.availableLinks = Link.query();       
          skill.links.push($scope.link);
          $scope.link = {};
        };

        /**
         * Removes link from skill
         * @param  {Object} skill skill to remove link from
         * @param  {Object} link  link to delete
         * @param  {int}    idx   idx in link array
         */
        $scope.removeSkillLink = function(skill, link, idx) {
          skill.links.splice(idx, 1);
        };

        // Query string for getting links
        $scope.q = null;

        var availableLinks = new Bloodhound({
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title'),
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          limit: 10,
          remote: '/links',
          prefetch: {
            url: '/links'
          }
        });
   
        // kicks off the loading/processing of `local` and `prefetch`
        availableLinks.initialize();

        $scope.queryLink = function (link, q) {
          availableLinks.get(q, function(suggestions) {
            $scope.availableLinks = suggestions;
            link.showAvailableLinks = true;            
          });  
          if (!q) {
            link.showAvailableLinks = false;
            // Clean up links
            delete link.showAvailableLinks;
          }    
        };

        /**
         * Approves skill
         * @param  {int} skill to be approved
         */
        $scope.approve = function (skill) {
          $http.post('/skills/approve/', {_id: skill._id}).success(function() {
            toaster.pop('success', 'Skill Approved!', 'Thanks for approving ' + skill.title);  
          });
          skill.approved += 1;        
        };

        /**
         * Checks if skills is shown
         * @param  {int}  skillsIdx index of selected skills
         * @return {Boolean}        shown skills details or not
         */
        $scope.isShown = function (skillsIdx) {
          return $scope.shownIdx === skillsIdx;
        };
    }]);

    /** Links Controller */
    geadenControllers.controller('LinksCtrl', [
        '$scope',
        'Link',
        '$http',
        'toaster',
        '$log', function($scope, Link, $http, toaster, $log) {
          $scope.link = {};

          $scope.links = Link.query();

          /**
           * Creates new link
           * @param  {Object} link the link to be created      
           */
          $scope.newLink = function (link) {
            var index = $scope.links.map(function(l) {
              return l.url;
            }).indexOf(link.url);
            var action = 'updated';
            if (index === -1) {
                action = 'added';
            }
            $http.post('/links', link).success(function(data) {
              if (action === 'added') {
                $scope.links.push(link);
              }
              toaster.pop('success', 'Link ' + action, 'Link ' + link.url + ' ' + action);
            }).error(function(error) {
              toaster.pop('error', 'Error: ' + error);
            });
            $scope.link = {};
          };

          /**
           * Start editing link
           * @param  {Object} link link to edit
           */
          $scope.editLink = function (link) {
            $scope.link = link;
            $('.link-form input')[0].focus();
          };

          /**
           * Removes link
           * @param  {Object} link the link to be deleted
           * @param  {int} idx  index of link
           */
          $scope.removeLink = function (link, idx) {
            $scope.links.splice(idx, 1);
            var data = link.action = 'delete';
            $http.post('/links', link).success(function(data) {
              toaster.pop('info', 'Link removed', 'Link ' + link.url + ' removed.');
            });
          };

          $scope.resetLink = function () {
            $scope.link = {};
          };
    }]);

    geadenControllers.controller('TabsCtrl', [
        '$scope',
        '$location',
        '$log', function($scope, $location, $log) {
          $scope.tabIndex = 0;
          $scope.tabs = ['Skills', 'Links', 'Goals'];

          /**
           * Selectes tab
           * @param  {ind} idx tab index
           */
          $scope.selectTab = function (idx) {
            $scope.tabIndex = idx;          
          };

          /**
           * Is tab is current
           * @param  {int} idx tab index to check
           * @return {Boolean} whether tab is current
           */
          $scope.currentTab = function (idx) {
            return $scope.tabIndex === idx;
          };
        }
      ]);

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

    /** Contacts controller */
    geadenControllers.controller('ContactsCtrl', [
      '$scope', 
      'Contact',
      '$http',
      'toaster',
      '$log', function ($scope, Contact, $http, toaster, $log) {  
        $scope.contacts = Contact.query();  

        // Initial message values
        $scope.email = '';
        $scope.subject = '';
        $scope.message = '';

        $scope.sendMessage = function () {
          $http.post('/email', {subject: $scope.subject,
            email: $scope.email,
            message: $scope.message
          }).success(function(data) {
            toaster.pop('success', 'Thanks', 'Thanks for your message ;)');
            $scope.resetEmail();          
          }).error(function(error) {
            toaster.pop('error', 'Error', 'Sorry, couldn\'t handle that :(');
          });
        };

        $scope.resetEmail = function () {
          // Reset email values
          $scope.email = '';
          $scope.subject = '';
          $scope.message = '';
        };
    }]);

    /** Navigation Controller */
    geadenControllers.controller('MenuCtrl', [
      '$scope',
      '$location',
      '$http', function($scope, $location, $http) {
        $scope.nav = [
          {href: '#/', id: 'home', title: 'Home'},
          {href: 'http://blog.geaden.com', id: 'blog', title: 'Blog'},
          {href: '#/goals', id: 'goals', title: 'Goals'},
          {href: '#/hoops', id: 'hoops', title: 'Hoops'}
        ];

        /**
         * Detects whether current path is active menu item
         * @param  {Object}  menu item to detect
         * @return {Boolean} current menu item is active
         */
        $scope.isActive = function(menuItem) {
          if ($location.path() === menuItem.href.substring(1, menuItem.href.length)) {
            return true;
          }
          return false;
        };

        // Toggle menu
        var $toggleMenu = $('#nav-toggle-menu');
        $toggleMenu.click(function() {
          $('.nav-icon').toggleClass('active');
          $('#nav-menu > ul').slideToggle('slow');
        });

        // Show menu if size is large enough
        $(window).resize(function() {        
          var $navMenu = $('#nav-menu > ul');
          if (!$navMenu.is(':visible')) {
            if ($(window).width() > 600) {
              $navMenu.show();
            }
          }
        });
      }
    ]);

    /** Version Controller */
    geadenControllers.controller('VersionCtrl', [
      '$scope',
      '$http', function($scope, $http) {
        // Version info
        $scope.versionInfo = {};

        $http.get('/data/versions.json')
          .success(function(data) {
            $scope.versionInfo = data;
            // Append AngularJS version
            $scope.versionInfo.libs.push({lib: 'AngularJS', version: angular.version.full});
            $scope.versionInfo.last_update = moment(
              $scope.versionInfo.last_update).format('MMM D, YYYY HH:mm:ss');
        });      
    }]);

    /** Hoops Controller */
    geadenControllers.controller('HoopsCtrl', [
      '$scope', function ($scope) {
        $scope.fibaShown = false;

        /**
         * Toggles showing FIBA
         */
        $scope.toggleFiba = function() {
          $scope.fibaShown = !$scope.fibaShown;
        }
    }])

    /** Goals Controller */
    geadenControllers.controller('GoalsCtrl', [
      '$scope', 
      'Goal',
      '$http',
      'toaster',
      '$log', function ($scope, Goal, $http, toaster, $log) {
        $scope.editedGoal = null;

        $scope.goals = Goal.query();

        $scope.editGoal = function (goal) {
          $scope.editedGoal = goal;
          // Clone the original goal to restore it on demand.
          $scope.originalGoal = angular.extend({}, goal);
        };

        $scope.addGoal = function () {
          var newGoal = $scope.newGoal.trim();
          if (!newGoal.length) {
            return;
          }      

          $http.post('/goals/data', {title: newGoal}).success(function(data) {
            $scope.goals.push(data);
            toaster.pop('success', 'Goal Added', 'Goal with id ' + data._id + ' successfully added.');
          }).error(function(error) {
            toaster.pop('error', 'Failed to add goal', 'Can\'t add new goal. Error: ' + error);
          });

          $scope.newGoal = '';
        };

        $scope.doneEditing = function (goal) {
          $scope.editedGoal = null;
          goal.title = goal.title.trim();
          if (goal.title !== $scope.originalGoal.title) {
            $http.post('/goals/data', {'_id': goal._id, 'title': goal.title, 'action': 'update'})
            .success(function(data) {
              goal = data;
              toaster.pop('success', 'Goal Updated', 'Goal with id ' + goal._id + ' successfully updated.'); 
            }).error(function(error) {
              $scope.revertEditing(goal);
              toaster.pop('error', 'Failed to update goal', 'Can\'t update goal. Error: ' + error);
            });
          }   
          return true;         
        };

        $scope.accomplish = function(goal) {
          $http.post('/goals/data', {'_id': goal._id, 'done': goal.done, 'action': 'accomplish'})
            .success(function(data) {
              goal = data;
              var action = goal.done ? 'accomplished' : 'set';
              toaster.pop('success', 'Goal ' + action, 'Goal with id ' + goal._id +
                ' successfully ' + action + '.'); 
            }).error(function(error) {
              goal.done = !goal.done;
              toaster.pop('error', 'Failed to accomplish goal', 'Can\'t accomplish goal. Error: ' + error);
            });
        };

        $scope.revertEditing = function (goal) {
          $scope.goals[$scope.goals.indexOf(goal)] = $scope.originalGoal;
          $scope.doneEditing($scope.originalGoal);
          return true;
        };

        $scope.removeGoal = function (goal) {        
          $http.post('/goals/data', {'_id': goal._id, 'action': 'delete'})
           .success(function(data) {
            $scope.goals[$scope.goals.indexOf(goal)] = data;
            toaster.pop('info', 'Goal Disabled', 'Goal with id ' + goal._id + ' disabled.');
           }).error(function(error) {
            toaster.pop('error', 'Failed to disable goal', 'Can\'t disable goal. Error: ' + error);
           });
        };

        $scope.restoreGoal = function (goal) {
          $http.post('/goals/data', {'_id': goal._id, 'action': 'restore'})
           .success(function(data) {
            $scope.goals[$scope.goals.indexOf(goal)] = data;
            toaster.pop('success', 'Goal Restored', 'Goal with id ' + goal._id + ' restored.');
           }).error(function(error) {
            toaster.pop('error', 'Failed to restore goal', 'Can\'t restore goal. Error: ' + error);
           });
        };

        $scope.purgeGoal = function (goal) {        
          $http.post('/goals/data', {'_id': goal._id, 'action': 'purge'})
           .success(function() {
            $scope.goals.splice($scope.goals.indexOf(goal), 1);
            toaster.pop('info', 'Goal Purged', 'Goal with id ' + goal._id + ' purged.');
           }).error(function(error) {
            toaster.pop('error', 'Failed to purge goal', 'Can\'t purge goal. Error: ' + error);
           });
        };
    }]);
})();
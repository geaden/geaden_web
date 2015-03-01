'use strict';

/* jasmine specs for controllers go here */
describe('Geaden controllers', function() {
  beforeEach(module('geaden'));

  beforeEach(function(){
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  describe('VersionCtrl', function() {
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/data/versions.json')
        .respond(function (method, url, data) {
          return [200, {libs: [], last_update: '2014-08-06T12:34:43'}, {}];
        });
      scope = $rootScope.$new();
      ctrl = $controller('VersionCtrl', {$scope: scope});
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.resetExpectations();
    });

    it('should create "versionInfo" model', function() {
      $httpBackend.flush();
      expect(scope.versionInfo.last_update).toBe('Aug 6, 2014 12:34:43');
    });
  });

  describe('MenuCtrl', function() {
    var scope, ctrl;

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller('MenuCtrl', {$scope: scope});
    }));

    it('should get active item', function() {
      var active = scope.isActive({href: '/', id: 'home', title: 'Home'});
      expect(active).toBe(true);
    });
  });

  describe('MyCtrl', function() {    
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('/data/me.json')
        .respond({name: 'John Doe', birthDay: '1987-05-10', pic: '/foo/bar.png'});     
      $httpBackend.whenGET('/data/versions.json')
        .respond(function (method, url, data) {
          return [200, {libs: [], last_update: '2014-08-06T12:34:43'}, {}];
        });  
      scope = $rootScope.$new();
      ctrl = $controller('MyCtrl', {$scope: scope});      
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.resetExpectations();
    });

    it('should create "me" model', function() {       
      expect(scope.info).toEqualData({});
      $httpBackend.flush();
      expect(scope.info.name).toBe('John Doe');
      var age = scope.age();
      expect(scope.age()).toBe(27);
      expect(scope.info.pic).toBe('/foo/bar.png');
    });
  });

  describe('QuotesCtrl', function() {
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/data/quotes.json').
        respond(
          [
            {content: 'To be or not to be', author: 'Hamlet'}, 
            {content: 'That is a question', author: 'Hamlet'}
          ]);
      scope = $rootScope.$new();
      ctrl = $controller('QuotesCtrl', {$scope: scope});
    }));

    it('should create "quotes" model', function() {
      expect(scope.quotes.length).toBe(0);
      $httpBackend.flush();
      expect(scope.quotes.length).toBe(2);
      expect(scope.currentQuoteIndex).toBe(0);
      expect(scope.quotes[0].author).toBe('Hamlet');
      expect(scope.quotes[0].content).toBe('To be or not to be');
      scope.nextQuote();
      expect(scope.currentQuoteIndex).toBe(1);
      scope.prevQuote();
      expect(scope.currentQuoteIndex).toBe(0);
      scope.prevQuote();
      expect(scope.currentQuoteIndex).toBe(1);      
    });
  });

  describe('SkillsCtrl', function() {
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/skills').
        respond(
          [
            {
              title: 'Python', 
              _id: 1,
              desc: 'Master of Python',
              order: 0,
              approved: 0,
              links: [
                {
                  url: 'http://www.github.com/geaden',
                  title: 'Github'
                },
                {
                  url: 'http://www.bitbucket.com/geaden',
                  title: 'Bitbucket'
                } 
              ]
            },
            {
              title: 'Java', 
              _id: 2,
              desc: 'Master of Java',
              approved: 0,
              order: 1,
              links: [
                {
                  url: 'http://www.github.com/geaden',
                  title: 'Github'
                },
                {
                  url: 'http://www.bitbucket.com/geaden',
                  title: 'Bitbucket'
                } 
              ]
            }          
          ]);
      $httpBackend.whenGET('/links')
        .respond([]);
      scope = $rootScope.$new();
      ctrl = $controller('SkillsCtrl', {$scope: scope});
    }));

    it('should create "skills" model', function() {
      expect(scope.skills.length).toBe(0);
      $httpBackend.flush();
      expect(scope.skills.length).toBe(2);
      expect(scope.shownIdx).toBeUndefined();
      expect(scope.skills[0].links.length).toBe(2);
    });

    it('should approve skill', function() {
      $httpBackend.flush();
      var skillId = 2;
      $httpBackend.expectPOST('/skills/approve/', {_id: skillId}).respond(201, '');
      scope.approve(scope.skills[1]);
      expect(scope.skills[1].approved).toBe(1);
    });  

    it('should delete skill', function() {
      $httpBackend.flush();
      var before = scope.skills.length;
      $httpBackend.expectPOST('/skills/', {_id: 2, action: 'delete'}).respond(200, '');
      scope.removeSkill(scope.skills[0], 0);
      expect(scope.skills.length).toBe(before - 1);
    }); 

    it('should create skill', function() {
      $httpBackend.flush();
      var before = scope.skills.length;
      var skill = {title: 'Python', desc: 'Love it!'};
      skill._id = 5;
      $httpBackend.expectPOST('/skills/', {data: skill, action: 'new'}).respond(201, skill);
      scope.addSkill(skill);      
    }); 
  });

  describe('LinksCtrl', function() {
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/links').
        respond(
          [
            {
              url: 'http://www.github.com/geaden',
              title: 'Github'
            },
            {
              url: 'http://www.bitbucket.com/geaden',
              title: 'Bitbucket'
            }          
          ]);
      scope = $rootScope.$new();
      ctrl = $controller('LinksCtrl', {$scope: scope});
    }));

    it('should create "links" model', function() {
      expect(scope.links.length).toBe(0);
      $httpBackend.flush();
      expect(scope.links.length).toBe(2);
      expect(scope.links[0].url).toBe('http://www.github.com/geaden');
    });

    it('should remove link', function() {
      expect(scope.links.length).toBe(0);
      $httpBackend.flush();
      expect(scope.links.length).toBe(2);
      scope.links[0].action = 'delete';
      $httpBackend.expectPOST('/links', scope.links[0]).respond('');
      scope.removeLink(scope.links[0], 0);
      expect(scope.links.length).toBe(1);
    });
  });

  describe('ExperienceCtrl', function() {
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/data/experience.json').
        respond(
          [
            {
              company: 'Foo', 
              start: 'May, 2014',
              end: 'December, 2014',
              summary: 'Cool company',
              position: 'Developer',
              url: 'http://www.foo.bar'
            },
            {
              company: 'Boo', 
              start: 'June, 2012',
              end: 'July, 2013',
              summary: 'Cool company',
              position: 'Developer',
              url: 'http://www.boo.bar'
            },        
          ]);
      scope = $rootScope.$new();
      ctrl = $controller('ExperienceCtrl', {$scope: scope});
    }));

    it('should create "experience" model', function() {
      expect(scope.experienceList.length).toBe(0);
      $httpBackend.flush();
      expect(scope.experienceList.length).toBe(2);
      expect(scope.experienceList[0].company).toBe('Foo');
    });
  });

 describe('TabsCtrl', function() {
    var scope, ctrl;

    beforeEach(inject(function($rootScope, $controller) {      
      scope = $rootScope.$new();
      ctrl = $controller('TabsCtrl', {$scope: scope});
    }));

    it('should create "skills tabs" model', function() {
      expect(scope.tabs.length).toBe(3);      
    });
  });

  describe('EducationCtrl', function() {
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/data/education.json').
        respond(
          [
            {
              school: 'Foo', 
              start: 'September, 2004',
              end: 'December, 2014',
              summary: 'Cool school',
              major: 'Engineer',
              url: 'http://www.foo.bar'
            }                
          ]);
      scope = $rootScope.$new();
      ctrl = $controller('EducationCtrl', {$scope: scope});
    }));

    it('should create "eductioan" model', function() {
      expect(scope.educationList.length).toBe(0);
      $httpBackend.flush();
      expect(scope.educationList.length).toBe(1);
      expect(scope.educationList[0].school).toBe('Foo');
    });
  });

  describe('ContactsCtrl', function() {
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/data/contacts.json').
        respond(
          [
            {
              url: 'http://www.google.com', 
              icon: 'google'              
            },
            {
              url: 'http://www.google.com', 
              icon: 'google'              
            }                                
          ]);
      scope = $rootScope.$new();
      ctrl = $controller('ContactsCtrl', {$scope: scope});
    }));

    it('should create "contact" model', function() {
      expect(scope.contacts.length).toBe(0);
      $httpBackend.flush();
      expect(scope.contacts.length).toBe(2);
      expect(scope.contacts[0].icon).toBe('google');
    });
  });

  describe('GoalsCtrl', function() {
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/goals/data').
        respond(
          [
            {
              _id: '123',
              title: 'Build a house', 
              votes: 1,
              done: false
            },
            {
              _id: '456',
              title: 'Plant a tree', 
              votes: 1,
              done: false
            },
            {
              _id: '789',
              title: 'Have a son', 
              votes: 1,
              done: false
            },           
          ]);
      scope = $rootScope.$new();
      ctrl = $controller('GoalsCtrl', {$scope: scope});
    }));

    it('should create "goal" model', function() {
      expect(scope.goals.length).toBe(0);
      $httpBackend.flush();
      expect(scope.goals.length).toBe(3);
      expect(scope.goals[0].title).toBe('Build a house');
    });

    it('should add new goals', function() {
      expect(scope.goals.length).toBe(0);
      scope.newGoal = 'Do Great Things';
      $httpBackend.expectPOST('/goals/data').respond({_id: 1, title: scope.newGoal});      
      scope.addGoal(scope.newGoal);
      $httpBackend.flush();
      expect(scope.goals.length).toBe(4);
    });

    it('should delete a goal', function() {
      expect(scope.goals.length).toBe(0);
      $httpBackend.flush();
      var beforeLength = scope.goals.length;
      var goal = scope.goals[0];
      $httpBackend.expectPOST('/goals/data').respond(
        {_id: 1, title: goal.title, enabled: false}); 
      scope.removeGoal(goal);
      $httpBackend.flush();
      expect(scope.goals.length).toBe(beforeLength);
      expect(scope.goals[0].enabled).toBe(false);
    });

    it('should restore a goal', function() {
      $httpBackend.flush();
      var goal = scope.goals[0];
      $httpBackend.expectPOST('/goals/data').respond(
        {_id: 1, title: goal.title, enabled: true}); 
      scope.restoreGoal(goal);
      $httpBackend.flush();
      expect(scope.goals[0].enabled).toBe(true);
    });

    it('should purge a goal', function() {
      expect(scope.goals.length).toBe(0);
      $httpBackend.flush();
      var beforeLength = scope.goals.length;
      var goal = scope.goals[0];
      $httpBackend.expectPOST('/goals/data').respond({_id: 1, title: scope.newGoal}); 
      scope.purgeGoal(goal);
      $httpBackend.flush();
      expect(scope.goals.length).toBe(beforeLength - 1);
    });
  });
});

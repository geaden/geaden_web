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

  describe('MyCtrl', function() {    
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/data/me.json').
        respond({name: 'John Doe', age: 27, pic: '/foo/bar.png'});
      scope = $rootScope.$new();
      ctrl = $controller('MyCtrl', {$scope: scope});
    }));

    it('should create "me" model', function() { 
      expect(scope.info).toEqualData({});
      $httpBackend.flush();    
      expect(scope.info.name).toBe('John Doe');
      expect(scope.info.age).toBe(27);
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
      $httpBackend.expectPOST('/skills/approve/', {_id: skillId}, function() {
        scope.skills[1].approved += 1;
      }).respond(201, '');
      scope.approve(skillId);
      expect(scope.skills[1].approved, 1);
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

    it('should create "eductiona" model', function() {
      expect(scope.educationList.length).toBe(0);
      $httpBackend.flush();
      expect(scope.educationList.length).toBe(1);
      expect(scope.educationList[0].school).toBe('Foo');
    });
  });
});

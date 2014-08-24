# -*- coding: utf-8 -*-

__author__ = 'Gennady Denisov <denisovgena@gmail.com>'

import json
import unittest

from google.appengine.ext import testbed

import webtest

import geaden
from models import Skill, Link, Goal
from load_data import load, load_goals


class BaseTestCase(unittest.TestCase):
    """
    Base Test Case
    """
    def setUp(self):
        # First, create an instance of the Testbed class.
        self.testbed = testbed.Testbed()
        # Set user stub
        self.testbed.setup_env(
            USER_EMAIL='usermail@gmail.com', USER_ID='1', USER_IS_ADMIN='1')        
        # Then activate the testbed, which prepares the service stubs for use.
        self.testbed.activate()
        # Next, declare which service stubs you want to use.
        self.testbed.init_datastore_v3_stub()
        self.testbed.init_memcache_stub()

    def tearDown(self):
        self.testbed.deactivate()


class PageTestCase(BaseTestCase):
    """
    Page Test Case
    """
    def setUp(self):
        super(PageTestCase, self).setUp()
        # Wrap the app with WebTest’s TestApp.
        self.testapp = webtest.TestApp(geaden.app)
        self.testbed.init_mail_stub()
        self.testbed.init_user_stub()
        self.mail_stub = self.testbed.get_stub(testbed.MAIL_SERVICE_NAME)        

    def testMainPage(self):
        response = self.testapp.get('/')
        self.assertEquals(response.status_int, 200)
        self.assertIn('{{ info.name }}', response.normal_body)

    def testSkillsHandler(self):
        load()
        response = self.testapp.get('/skills')
        self.assertEquals(response.status_int, 200)
        self.assertEquals(response.content_type, 'application/json')
        data = json.loads(response.normal_body)
        self.assertEquals(4, len(data))
        # Approve skill
        skill = Skill(title="Math").put()
        response = self.testapp.post_json('/skills/approve/', {'_id': skill.id()})
        self.assertEquals(response.status_int, 201)
        self.assertEquals(Skill.get(skill.id()).approved, 1)
        # Create skill
        before = len(Skill.all())
        response = self.testapp.post_json('/skills',
            {
                'action': 'new',
                'data': {
                    'title': 'Python',
                    'desc': 'Love it!',
                    'links': [
                        {
                            'url': 'http://www.github.com',
                            'title': 'My Github'
                        }
                    ]
                }
            })
        self.assertEquals(response.status_int, 201)
        self.assertEquals(response.content_type, 'application/json')
        self.assertEquals(before + 1, len(Skill.all()))
        # Remove skill
        before = len(Skill.all())
        response = self.testapp.post_json('/skills', 
            {
                '_id': skill.id(), 
                'action': 'delete'
            })
        self.assertEquals(response.status_int, 200)
        self.assertEquals(before - 1, len(Skill.all()))
        # Updte skill
        links_before = len(Link.query().fetch())
        skill = Skill(title='Foo', desc='Bar').put()
        response = self.testapp.post_json('/skills',
            {
                'action': 'update',
                'data': {
                    '_id': skill.id(),
                    'title': 'Noob',
                    'desc': 'Noob!',
                    'links': [
                        {
                            'url': 'http://www.noob.com',
                            'title': 'Noob Com'                            
                        }
                    ]
                }
            })
        self.assertEquals(200, response.status_int)        
        self.assertEquals(links_before + 1, len(Link.query().fetch()),
            msg="Should create new link.")
        skill = Skill.get(skill.id())
        self.assertEquals(len(skill.links), 1)
        self.assertEquals(skill.title, 'Noob')

    def testLinksHandler(self):
        load()
        response = self.testapp.get('/links')
        self.assertEquals(response.status_int, 200)
        self.assertEquals(response.content_type, "application/json")
        data = json.loads(response.normal_body)
        self.assertEquals(len(data), 8)        
        # create link
        before = len(Link.query().fetch())
        response = self.testapp.post_json('/links', {'title': 'Foo',
            'url': 'http://www.foo.bar'})
        self.assertEquals(response.status_int, 201)
        self.assertEquals(len(Link.query().fetch()), before + 1)
        # Update link
        response = self.testapp.post_json('/links', {'title': 'Foo Bar',
            'url': 'http://www.foo.bar'});
        self.assertEquals(response.status_int, 200)
        # Quantaty of links doesn't change
        self.assertEquals(len(Link.query().fetch()), before + 1)
        link = Link.get_by_id('http://www.foo.bar')
        self.assertEquals(link.title, 'Foo Bar')   
        # Delete link
        before = len(Link.query().fetch())
        response = self.testapp.post_json('/links', 
            {'action': 'delete', 'title': 'Foo Bar',
            'url': 'http://www.foo.bar'});
        self.assertEquals(response.status_int, 200);
        self.assertEquals(before - 1, len(Link.query().fetch()))

    def testEditorHandler(self):
        load();
        response = self.testapp.get('/edit')
        self.assertEquals(response.status_int, 200)

    def testContactsHandler(self):
        response = self.testapp.post_json('/email',
            {'email': 'test@test.com',
             'subject': 'foo',
             'message': 'bar'})
        self.assertEquals(response.status_int, 200)
        self.assertEquals(response.content_type, 'application/json')        
        messages = self.mail_stub.get_sent_messages(sender=geaden.DEFAULT_EMAIL_ADDRESS)
        self.assertEqual(1, len(messages))
        self.assertIn('test@test.com', messages[0].body.decode())
        self.assertIn('<h1>foo</h1>', messages[0].html.decode())
        self.assertEqual(geaden.DEFAULT_EMAIL_ADDRESS, messages[0].sender)

    def testGoalsHandler(self):
        response = self.testapp.get('/goals')
        self.assertEquals(response.status_int, 200)

    def testGoalsDataHandler(self):
        load_goals()
        # List goals
        response = self.testapp.get('/goals/data')
        self.assertEquals(response.status_int, 200)
        self.assertEquals(response.content_type, 'application/json')
        data = json.loads(response.normal_body)
        self.assertEquals(len(data), 3)
        # Add goal
        response = self.testapp.post_json('/goals/data', 
            {'title': 'Do Great Things'})
        self.assertEquals(response.status_int, 200)
        self.assertEquals(len(Goal.all()), 4)
        messages = self.mail_stub.get_sent_messages(sender=geaden.DEFAULT_EMAIL_ADDRESS)
        self.assertEqual(1, len(messages))
        self.assertIn('Do Great Things', messages[0].html.decode())
        self.assertEqual(geaden.DEFAULT_EMAIL_ADDRESS, messages[0].sender)
        # Complete goal
        goal = Goal.all()[0]
        self.assertFalse(goal.done)
        response = self.testapp.post_json('/goals/data', 
            {'_id': goal.key.id(), 'done': True, 'action': 'accomplish'})
        self.assertEquals(response.status_int, 200)
        goal = Goal.get(goal.key.id())
        self.assertTrue(goal.done)
        # Update goal
        response = self.testapp.post_json('/goals/data',
            {
                '_id': goal.key.id(), 
                'action': 'update', 
                'title': 'Do What Matters'}
            )
        self.assertEquals(response.status_int, 200)
        goal = Goal.get(goal.key.id())
        self.assertEquals(goal.title, 'Do What Matters')
        # Remove goal
        response = self.testapp.post_json('/goals/data', 
            {'_id': goal.key.id(), 'action': 'delete'})
        self.assertEquals(response.status_int, 200)
        self.assertEquals(3, len(Goal.all()))

    def testNotFoundPageHandler(self):
        response = self.testapp.get('/asdf', status=404)
        self.assertEquals(response.status_int, 404)
        self.assertIn('Sorry...', response.normal_body)


class ModelsTestCase(BaseTestCase):
    """
    Models Test Case
    """
    def testSkillModel(self):
        load()
        skill = Skill(title='Python', desc='Cool',
            links=['http://www.github.com/'])
        skill.approve()
        self.assertEquals(skill.approved, 1)
        skills = Skill.all()
        self.assertEquals(len(skills), 4)
        s_key = skill.put()
        skill.id = s_key.id()
        skill.put()
        s = Skill.get(skill.id)
        self.assertEquals(skill.id, s_key.id())

    def testLinkModel(self):
        link = Link(id='http://www.github.com/', title='My Github')
        Link(id='http://www.bitbucket.com/',
            title='My bitbucket')
        link_key = link.put()
        self.assertEquals(link_key.id(), 'http://www.github.com/')
        # Link queries
        link = Link.get_by_id('http://www.github.com/')
        self.assertEquals(link.title, 'My Github')

    def testDeleteSkill(self):
        skill = Skill(title='foo').put()
        s = Skill.get(skill.id())
        s.enabled = False
        s.put()
        self.assertEquals(0, len(Skill.all()))

    def testGoalModel(self):
        goal = Goal(title="Do Great things")
        goal_key = goal.put()
        self.assertEquals(len(Goal.all()), 1)
        g = Goal.get(goal_key.id())
        self.assertEquals(g.title, "Do Great things")
        self.assertFalse(g.done)

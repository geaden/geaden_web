# -*- coding: utf-8 -*-

__author__ = 'Gennady Denisov <denisovgena@gmail.com>'

import json
import unittest

from google.appengine.ext import testbed

import webtest

import geaden

from models import Skill, Link

from load_data import load


class BaseTestCase(unittest.TestCase):
    """
    Base Test Case
    """
    def setUp(self):
        # First, create an instance of the Testbed class.
        self.testbed = testbed.Testbed()
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

    def testEditorHandler(self):
        load();
        response = self.testapp.get('/edit')
        self.assertEquals(response.status_int, 200)


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



# -*- coding: utf-8 -*-

__author__ = 'Gennady Denisov <denisovgena@gmail.com>'

import json
import unittest

from google.appengine.ext import testbed

import webtest

import geaden

from models import Skills, Link

from load_data import load_skills


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
        load_skills()
        response = self.testapp.get('/skills')
        self.assertEquals(response.status_int, 200)
        self.assertEquals(response.content_type, 'application/json')
        data = json.loads(response.normal_body)
        self.assertEquals(4, len(data))
        # Approve skill
        skill = Skills(title="Math").put()
        response = self.testapp.post_json('/skills/approve/', {'_id': skill.id()})
        self.assertEquals(response.status_int, 201)
        self.assertEquals(Skills.get(skill.id()).approved, 1)

    def testSkillsEditorHandler(self):
        load_skills();
        response = self.testapp.get('/skills')
        self.assertEquals(response.status_int, 200)


class ModelsTestCase(BaseTestCase):
    """
    Models Test Case
    """
    def testSkillModel(self):             
        skill = Skills(title="Python", desc="Cool", 
            links=[Link(title='Github', url='http://www.github.com')])
        skill.approve()
        self.assertEquals(skill.approved, 1)
        load_skills()
        skills = Skills.all()        
        self.assertEquals(len(skills), 4)
        s_key = skill.put()
        skill.id = s_key.id()
        skill.put()
        s = Skills.get(skill.id)
        self.assertEquals(skill.id, s_key.id())



#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import webapp2

import json

from jinja import JINJA_ENVIRONMENT as jinja_env

from models import Skill, Link

import logging

__author__ = 'geaden'


class MainHandler(webapp2.RequestHandler):
    """
    Basic handler for web application.
    """
    def write(self, *args, **kwargs):
        """
        Write out in response provided args and kwargs
        """
        return self.response.out.write(*args, **kwargs)

    def render_str(self, template, **params):
        """
        Rendering provided kwargs into template
        """
        t = jinja_env.get_template(template)
        return t.render(params)

    def render(self, template, **kwargs):
        """
        Render page
        """
        return self.write(self.render_str(template, **kwargs))

    def initialize(self, *args, **kwargs):
        """
        Initializing Main Handler.
        """
        webapp2.RequestHandler.initialize(self, *args, **kwargs)


def date_handler(obj):
    return obj.isoformat() if hasattr(obj, 'isoformat') else obj


class SkillsEditPageHandler(MainHandler):
    """
    Skills Editor Handler
    """
    def get(self):
        self.render('skills.html')


class SkillsJSONHandler(webapp2.RequestHandler):
    """
    Skills JSON Handler
    """
    def get(self):        
        self.response.headers.add_header("Content-type", "application/json")
        resp = []
        for skill in Skill.all():
            skill_dict = skill.to_dict();
            skill_dict.update({'_id': skill.key.id()})
            resp.append(skill_dict)      
        self.response.out.write(json.dumps(resp, default=date_handler, indent=4))

    def post(self, *args, **kwargs):
        allowed_actions = ['delete', 'update', 'new'];        
        data = json.loads(self.request.body)
        action = data['action']
        if action in allowed_actions:
            if action == 'delete':
                skill = Skill.get(data['_id'])
                skill.key.delete()
                self.response.set_status(200)
                return  
            if action == 'new':
                if 'data' in data:
                    self.response.headers.add_header('Content-type', 'application/json')
                    skill_data = data['data']
                    skill = Skill(title=skill_data['title'], 
                        desc=skill_data['desc']) 
                    if 'links' in skill_data:
                        skill.links = [Link(title=link['title'],
                            url=link['url']) for link in skill_data['links']]
                    skill_key = skill.put();
                    skill_dict = skill.to_dict()
                    skill_dict.update({'_id': skill_key.id()})
                    self.response.set_status(201)
                    return self.response.out.write(
                        json.dumps(skill_dict, default=date_handler, indent=4))
                else:
                    return self.error(400)
            if action == 'update':
                self.response.headers.add_header('Content-type', 'application/json')
                return
        return self.error(400)


class SkillsApproverHandler(webapp2.RequestHandler):
    """
    Approves skill
    """
    def post(self):
        data = json.loads(self.request.body)
        skill = Skill.get(data['_id'])
        skill.approve()
        skill.put()
        self.response.set_status(201)


class MainPage(MainHandler):
    """
    Main page handler
    """
    def get(self):
        self.render('index.html')


app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/skills/?', SkillsJSONHandler),
    ('/skills/edit', SkillsEditPageHandler),
    ('/skills/approve/?', SkillsApproverHandler)
], debug=True)

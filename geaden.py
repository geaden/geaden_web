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
import datetime

from jinja import JINJA_ENVIRONMENT as jinja_env

from google.appengine.api import mail

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


class LinksJSONHandler(webapp2.RequestHandler):
    """
    Links JSON Handler
    """
    def get(self):
        self.response.headers.add_header("Content-type", "application/json")
        resp = [link.to_dict()
                for link in Link.query().fetch()]
        self.response.out.write(
            json.dumps(resp, default=date_handler, indent=4))

    def post(self, *args, **kwargs):
        self.response.headers.add_header("Content-type", "application/json")
        link_data = json.loads(self.request.body)
        link_id = link_data['url']
        link = Link.get_by_id(link_id)
        if link:
            # update link
            link.title = link_data['title']
            self.response.set_status(200)
        else:
            link = Link(title=link_data['title'],
                id=link_data['url'])
            self.response.set_status(201)
        link.put()
        return self.response.out.write(json.dumps(link.to_dict()))


class SkillsJSONHandler(webapp2.RequestHandler):
    """
    Skills JSON Handler
    """
    def get(self):        
        self.response.headers.add_header("Content-type", "application/json")
        resp = [skill.to_dict() for skill in Skill.all()]    
        self.response.out.write(json.dumps(resp, default=date_handler, indent=4))

    def insert_or_update(self, data):
        """
        Inserts or updates skill
        """
        self.response.headers.add_header('Content-type', 'application/json')
        if 'data' in data:
            skill_data = data['data']
            status = 201
            if '_id' in skill_data:
                # update
                logging.info('Updaing...')
                skill = Skill.get(skill_data['_id'])
                skill.title = skill_data['title']
                skill.desc = skill_data['desc']
                status = 200              
            else:
                # insert
                skill = Skill(title=skill_data['title'], 
                    desc=skill_data['desc'])                 
            if 'links' in skill_data:                
                    skill.links = [link['url'] 
                        for link in skill_data['links']]
            skill_key = skill.put();
            skill_dict = skill_key.get().to_dict()
            self.response.set_status(status)
            return self.response.out.write(
                json.dumps(skill_dict, default=date_handler, indent=4))
        return self.error(400)

    def post(self, *args, **kwargs):
        allowed_actions = ['delete', 'update', 'new'];        
        data = json.loads(self.request.body)
        action = data['action']
        if action in allowed_actions:
            if action == 'delete':
                skill = Skill.get(data['_id'])
                skill.enabled = False
                skill.put()
                self.response.set_status(200)
                return  
            if action == 'new':
                return self.insert_or_update(data)
            if action == 'update':
                return self.insert_or_update(data)
        return self.error(400)


DEFAULT_EMAIL_ADDRESS = 'denisovgena@gmail.com'


class ContactsJSONHandler(webapp2.RequestHandler):
    """
    Sends email
    """
    def post(self, *args, **kwargs):
        self.response.headers['Content-Type'] = 'application/json'
        data = json.loads(self.request.body)
        email = data.get('email', None)
        subject = data['subject']
        msg = data['message']
        # Cannot send from unauthorized senders
        message = mail.EmailMessage(sender=DEFAULT_EMAIL_ADDRESS,
                                    subject=subject)
        message.to = DEFAULT_EMAIL_ADDRESS
        email_body = jinja_env.get_template('email/email_body.txt')
        # TODO: send message to user as well!
        template_attrs = {'email': email,
                          'subject': subject,
                          'message': msg}
        message.body = email_body.render(template_attrs)
        email_html = jinja_env.get_template('email/email_body.html')
        message.html = email_html.render(template_attrs)
        message.send()


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


class EditPageHandler(MainHandler):
    """
    Editor Handler
    """
    def get(self):
        self.render('edit.html')


class MainPage(MainHandler):
    """
    Main page handler
    """
    def get(self):
        self.render('index.html',
            **{
                'gae_version': '1.9.8',
                'python_version': '2.7',
                'angular_version': '1.2.21',
                'last_updated': datetime.datetime(2014, 8, 6, 10, 54)
            })


app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/skills/?', SkillsJSONHandler),
    ('/links/?', LinksJSONHandler),
    ('/edit/?', EditPageHandler),
    ('/email/?', ContactsJSONHandler),
    ('/skills/approve/?', SkillsApproverHandler)
], debug=True)

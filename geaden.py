#!/usr/bin/env python

import os
import json
import datetime

import webapp2

from jinja import JINJA_ENVIRONMENT

from google.appengine.api import mail
from google.appengine.api import users

from models import Skill, Link, Goal

import logging

__author__ = 'Gennady Denisov <denisovgena@gmail.com>'


DEBUG = True if os.environ.get('DEBUG', False) == 'True' else False


class MainHandler(webapp2.RequestHandler):
    """
    Basic handler for web application.
    """
    template = None

    def write(self, *args, **kwargs):
        """
        Write out in response provided args and kwargs
        """
        return self.response.out.write(*args, **kwargs)

    def render_str(self, template, **params):
        """
        Rendering provided kwargs into template
        """
        t = JINJA_ENVIRONMENT.get_template(template)
        # Add DEBUG parameter
        params['DEBUG'] = DEBUG
        return t.render(params)

    def get_kwargs(self):
        kwargs = {}
        user = users.get_current_user()
        if user:
            if users.is_current_user_admin():
                kwargs['user'] = user
                kwargs['logout_url'] = users.create_logout_url('/')
        return kwargs

    def render(self, **kwargs):
        """
        Render page
        """
        if self.template is None:
            raise ValueError('No template!')
        return self.write(self.render_str(self.template, **kwargs))

    def initialize(self, *args, **kwargs):
        """
        Initializing Main Handler.
        """
        webapp2.RequestHandler.initialize(self, *args, **kwargs)

    def get(self):
        kwargs = self.get_kwargs()
        self.render(**kwargs)


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
            if 'action' in link_data:
                if link_data['action'] == 'delete':
                    link.key.delete()
                    return
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
        self.response.out.write(
            json.dumps(resp, default=date_handler, indent=4))

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
                skill.links = []
                for link in skill_data['links']:
                    skill.links.append(link['url'])
                    l = Link.get_by_id(link['url'])
                    if l is None:
                        Link(title=link['title'], id=link['url']).put()
            skill_key = skill.put()
            skill_dict = skill_key.get().to_dict()
            self.response.set_status(status)
            return self.response.out.write(
                json.dumps(skill_dict, default=date_handler, indent=4))
        return self.error(400)

    def post(self, *args, **kwargs):
        allowed_actions = ['delete', 'update', 'new']
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
                                    subject='geaden.com: {0}'.format(subject))
        message.to = DEFAULT_EMAIL_ADDRESS
        email_body = JINJA_ENVIRONMENT.get_template('email/email_body.txt')
        # TODO: send message to user as well!
        template_attrs = {'email': email,
                          'subject': subject,
                          'message': msg,
                          'now': datetime.datetime.now()}
        message.body = email_body.render(template_attrs)
        email_html = JINJA_ENVIRONMENT.get_template('email/email_body.html')
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
    template = 'edit.html'


class GoalsPageHandler(MainHandler):
    """
    Goals Handler
    """
    template = 'goals.html'


class GoalsJSONHandler(webapp2.RequestHandler):
    ACCOMPLISH = 'accomplish'
    UPDATE = 'update'
    DELETE = 'delete'
    PURGE = 'purge'
    RESTORE = 'restore'

    def get(self):
        self.response.headers.add_header('Content-Type', 'application/json')
        goals = Goal.all()
        return self.response.out.write(
            json.dumps([g.to_dict() for g in goals], indent=4))

    def post(self):
        self.response.headers.add_header('Content-Type', 'application/json')
        goal_data = json.loads(self.request.body)
        if 'action' in goal_data:
            if goal_data['action'] in [
                    self.ACCOMPLISH,
                    self.UPDATE,
                    self.DELETE,
                    self.PURGE,
                    self.RESTORE]:
                # Modify goal
                if '_id' in goal_data:
                    goal = Goal.get(goal_data['_id'])
                    if goal_data['action'] == self.ACCOMPLISH:
                        goal.done = goal_data['done']
                        goal.put()
                        return self.response.out.write(
                            json.dumps(goal.to_dict(),
                                       indent=4))
                    elif goal_data['action'] == self.UPDATE:
                        title = goal_data['title']
                        goal.title = title
                        goal.put()
                        return self.response.out.write(
                            json.dumps(goal.to_dict(),
                                       indent=4))
                    elif goal_data['action'] == self.DELETE:
                        goal.delete()
                        return self.response.out.write(
                            json.dumps(goal.to_dict(),
                                       indent=4))
                    elif goal_data['action'] == self.RESTORE:
                        goal.restore()
                        return self.response.out.write(
                            json.dumps(goal.to_dict(),
                                       indent=4))
                    elif goal_data['action'] == self.PURGE:
                        goal.purge()
                        return
                return self.error(400)
            else:
                return self.error(400)
        goal_key = Goal(title=goal_data['title']).put()
        return self.response.out.write(json.dumps(goal_key.get().to_dict(),
                                                  indent=4))


class NotFoundPageHandler(MainHandler):
    """
    404 error handler
    """
    template = '404.html'

    def get(self):
        self.response.set_status(404)
        self.render()


class MainPage(MainHandler):
    """
    Main page handler
    """
    template = 'index.html'


class HoopsPage(MainHandler):
    """
    Hoops page handler
    """
    template = 'hoops.html'


class PiDayPageHandler(MainHandler):
    """
    Pi Day page handler
    """
    template = 'pi_day.html'


app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/hoops/?', HoopsPage),
    ('/skills/?', SkillsJSONHandler),
    ('/links/?', LinksJSONHandler),
    ('/edit/?', EditPageHandler),
    # ('/goals/?', GoalsPageHandler),
    ('/pi/?', PiDayPageHandler),
    ('/goals/data/?', GoalsJSONHandler),
    ('/email/?', ContactsJSONHandler),
    ('/skills/approve/?', SkillsApproverHandler),
    ('/.*', NotFoundPageHandler)
], debug=DEBUG)

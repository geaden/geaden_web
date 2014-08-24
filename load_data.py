# -*- coding: utf-8 -*-

import json
import sys
import os


SDK_PATH = '/usr/local/google_appengine'
REMOTE_API_PORT = os.environ.get('API_PORT', 7000)

sys.path.insert(0, SDK_PATH)
sys.path.insert(0, os.path.join(SDK_PATH, 'lib', 'fancy_urllib'))

from google.appengine.ext import ndb
from google.appengine.ext.remote_api import remote_api_stub

from models import Skill, Link, Goal


def load_links():
    # Loads links
    links = json.load(open('data/links.json'))
    data = []
    for link in links:
        l = Link(title=link['title'],
            id=link['url'])
        data.append(l)
    ndb.put_multi(data)


def load_skills():
    # Loads skills
    skills = json.load(open('data/skills.json'))
    data = []
    for skill in skills:
        s = Skill(
            title=skill['title'],
            desc=skill['desc'])
        if 'links' in skill:
            s.links = skill['links']
        data.append(s)
    ndb.put_multi(data)


def load_goals():
    goals = json.load(open('data/goals.json'))
    data = []
    for goal in goals:
        g = Goal(
            title=goal['title'],
            done=goal['done'],
            votes=goal['votes'])
        data.append(g)
    ndb.put_multi(data)


def auth_func():
    return ('test@example.com', 'example')


def load():
    load_links()
    load_skills()
    load_goals()


if __name__ == '__main__':
    remote_api_stub.ConfigureRemoteApi(None, '/_ah/remote_api', auth_func, 
        'localhost:{0}'.format(REMOTE_API_PORT))
    load()

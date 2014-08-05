# -*- coding: utf-8 -*-

import json

from google.appengine.ext import ndb

from models import Skill, Link


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


def load():
    load_links()
    load_skills()


if __name__ == '__main__':
    load()

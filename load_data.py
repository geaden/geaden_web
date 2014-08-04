# -*- coding: utf-8 -*-

import json

from google.appengine.ext import ndb

from models import Skills, Link


def load_skills():
    # Loads skills    
    skills = json.load(open('data/skills.json'))
    data = []
    for skill in skills:
        s = Skills(
            title=skill['title'],
            desc=skill['desc'])
        if 'links' in skill:
            s.links = [
                Link(title=link['title'], url=link['url'])
                for link in skill['links']]
        data.append(s)
    ndb.put_multi(data)


if __name__ == '__main__':
    load()
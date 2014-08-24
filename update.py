#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Updates libs versions and last update time.

Runs locally (or on CI side)
"""

__author__ = 'Gennady Denisov <denisovgena@gmail.com>'

import sys
import json
import datetime


def update():
    with open('data/versions.json', 'r') as f:
        versions = json.load(f)
    versions['libs'] = [
        {'lib': 'Google App Engine', 'version': '1.9.9'},
        {'lib': 'Python', 'version': sys.version.split(' ')[0]}]
    versions['last_update'] = datetime.datetime.now().isoformat()
    git_hash = sys.argv[1]
    versions['hash'] = git_hash
    with open('data/versions.json', 'w') as f:
        json.dump(versions, f, indent=4)


if __name__ == '__main__':
    update()

#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Updates libs versions and last update time.

Runs locally (or on CI side)
"""

__author__ = 'Gennady Denisov <denisovgena@gmail.com>'

import sys
import json
import yaml
import datetime


def appcfg():
    """
    Update app.yaml if necessary
    """
    # Update DEBUG state to False
    with open('app.yaml', 'r') as f:
        app_cfg = yaml.safe_load(f)
    app_cfg['env_variables']['DEBUG'] = 'False'
    app_cfg['version'] = 'test'
    stream = yaml.dump(app_cfg, default_flow_style=False)
    with open('app.yaml', 'w') as f:
        f.write(stream)


def update():
    with open('data/versions.json', 'r') as f:
        versions = json.load(f)
    versions['libs'] = [
        {'lib': 'Google App Engine', 'version': '1.9.8'},
        {'lib': 'Python', 'version': sys.version.split(' ')[0]}]
    versions['last_update'] = datetime.datetime.now().isoformat()
    with open('data/versions.json', 'w') as f:
        json.dump(versions, f, indent=4)


if __name__ == '__main__':
    update()

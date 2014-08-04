# -*- coding: utf-8 -*-

"""
Jinja2 environment configuration to use with Angular JS
"""
__author__ = 'Gennady Denisov <denisovgena@gmail.com'

import os
import jinja2


# Define template dir.
template_dir = os.path.join(
    os.path.dirname(__file__),
    'html')

# Define jinja environment.
JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(template_dir),
    extensions=['jinja2.ext.autoescape'],
    variable_start_string='<#=', variable_end_string='#>', autoescape=True)

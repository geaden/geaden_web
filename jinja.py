# -*- coding: utf-8 -*-

"""
Jinja2 environment configuration to use with Angular JS
"""
__author__ = 'Gennady Denisov <denisovgena@gmail.com'

import os
import jinja2

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    variable_start_string='<#=', variable_end_string='#>', autoescape=True)

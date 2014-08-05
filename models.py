# -*- coding: utf-8 -*-

from google.appengine.ext import ndb


class Link(ndb.Model):
    """Represents link data type."""
    url = ndb.StringProperty()
    title = ndb.StringProperty()

    def to_dict(self):
        d = super(Link, self).to_dict()
        d.update({'_id': self.key.id()})
        return d


class Skill(ndb.Model):
    """Models an individual Skill entry with title and desc, approved and link."""
    title = ndb.StringProperty()
    desc = ndb.StringProperty()
    approved = ndb.IntegerProperty(default=0)
    links = ndb.StructuredProperty(Link, repeated=True)
    date = ndb.DateTimeProperty(auto_now_add=True)

    def approve(self):
        """
        Approves skill
        """
        self.approved += 1

    def to_dict(self):
        d = super(Skill, self).to_dict()
        d.update({'_id': self.key.id()})
        return d

    @classmethod
    def delete(cls, skill_id):
        return cls.get(int(skill_id)).delete()

    @classmethod
    def get(cls, skill_id):
        return cls.get_by_id(int(skill_id))

    @classmethod
    def all(cls):
        return cls.query().fetch()

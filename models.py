# -*- coding: utf-8 -*-

from google.appengine.ext import ndb


class Link(ndb.Model):
    """Represents link data type."""
    title = ndb.StringProperty()

    def to_dict(self):
        d = super(Link, self).to_dict()
        d.update({'url': self.key.id()})
        return d


class Skill(ndb.Model):
    """Models an individual Skill entry with title and desc,
    approved and link."""
    title = ndb.StringProperty()
    desc = ndb.StringProperty()
    approved = ndb.IntegerProperty(default=0)
    order = ndb.IntegerProperty(default=0)
    links = ndb.StringProperty(repeated=True)
    date = ndb.DateTimeProperty(auto_now_add=True)
    enabled = ndb.BooleanProperty(default=True)

    def approve(self):
        """
        Approves skill
        """
        self.approved += 1

    def to_dict(self):
        d = super(Skill, self).to_dict()
        d.update({'_id': self.key.id()})
        if d['links']:
            links = []
            for link in d['links']:
                l = Link.get_by_id(link)
                if l:
                    links.append(l.to_dict())
            d['links'] = links
        return d

    @classmethod
    def delete(cls, skill_id):
        return cls.get(int(skill_id)).delete()

    @classmethod
    def get(cls, skill_id):
        return cls.get_by_id(int(skill_id))

    @classmethod
    def all(cls):
        return cls.query(Skill.enabled == True).order(-cls.approved).fetch()


class Goal(ndb.Model):
    """
    Goal Model
    """
    title = ndb.StringProperty()
    done = ndb.BooleanProperty(default=False)
    votes = ndb.IntegerProperty(default=0)
    enabled = ndb.BooleanProperty(default=True)

    def to_dict(self):
        d = super(Goal, self).to_dict()
        d.update({'_id': self.key.id()})
        return d

    def delete(self):
        self.enabled = False
        self.put()

    @classmethod
    def all(cls):
        return cls.query(Goal.enabled == True).order(-cls.votes).fetch()

    @classmethod
    def get(cls, goal_id):
        return cls.get_by_id(int(goal_id))


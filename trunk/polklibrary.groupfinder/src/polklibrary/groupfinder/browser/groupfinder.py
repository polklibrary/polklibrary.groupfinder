
from plone import api
from Products.Five import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from zope.component import getUtility
from plone.registry.interfaces import IRegistry
import datetime,json,urllib


class GroupFinder(BrowserView):

    template = ViewPageTemplateFile('groupfinder.pt')
   
    def __call__(self):
        self.request.response.setHeader('Cache-Control', 'no-cache, no-store')
        return self.template()

    def current_userroles(self):
        return json.dumps({
            'Review': api.user.has_permission('Review', obj=self.context),
            'Add': api.user.has_permission('Add', obj=self.context),
            'Edit': api.user.has_permission('Modify portal content', obj=self.context),
            'View': api.user.has_permission('View', obj=self.context),
        })
        
    def banned_users(self):
        listing = self.context.banned
        if listing == None:
            listing = ""
        return json.dumps(listing.replace('\r','').split('\n'))
        
    def banned_words(self):
        listing = self.context.banned_words
        if listing == None:
            listing = ""
        return json.dumps(listing.replace('\r','').replace('_',' ').split('\n'))

    def get_rooms(self):
        rooms = []
        brains = api.content.find(context=api.portal.get(), portal_type='polklibrary.groupfinder.models.room', sort_on='getObjPositionInParent', sort_order='ascending')
        for brain in brains:
            room = brain.getObject()
            body = ''
            if room.body:
                body = room.body.output
            cache = {}
            if room.cached != None:
                cache = room.cached
            rooms.append({
                'Id': str(room.getId()),
                'Title': str(room.Title()),
                'image': room.absolute_url() + '/@@download/image/' + str(room.image.filename),
                'getURL': room.absolute_url(),
                'extraCSS': room.extra_css,
                'body': body,
            })
        return rooms
        
    def get_rooms_json(self):
        return json.dumps(self.get_rooms())
        
    def get_today(self):
        return datetime.datetime.now().strftime('%Y-%m-%d')
    
    def get_locations_json(self):
        return json.dumps(self.get_locations())
    
    def get_locations(self):
        locations = []
        brains = api.content.find(context=api.portal.get(), portal_type='polklibrary.groupfinder.models.location')
        for brain in brains:
            location = brain.getObject()
            body = ''
            if location.body:
                body = location.body.output
            locations.append({
                'Title': str(location.Title()),
                'calendar_id': str(location.calendar_id),
                'image': location.absolute_url() + '/@@download/image/' + str(location.image.filename),
                'getURL': location.absolute_url(),
                'body': body,
            })
        return locations
   
    @property
    def portal(self):
        return api.portal.get()
        
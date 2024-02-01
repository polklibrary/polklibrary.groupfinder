from plone import api
from Products.Five import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from zope.component import getUtility
from plone.registry.interfaces import IRegistry
from zope.interface import alsoProvides
from plone.protect.interfaces import IDisableCSRFProtection
import datetime,json,urllib,base64,time
import DateTime

class QRView(BrowserView):


    template = ViewPageTemplateFile('qr.pt')
    
    # https://www.uwosh.edu/library/services/reserve-rooms/qr_reservations?minutes=60&id=2nd-floor-large-group-room
    # https://www.uwosh.edu/library/services/reserve-rooms/qr_reservations?minutes=120&id=2nd-floor-large-group-room
    # https://www.uwosh.edu/library/services/reserve-rooms/qr_reservations?minutes=180&id=2nd-floor-large-group-room

    def __call__(self):
        self.request.response.setHeader('Content-Type', 'application/json')
        self.request.response.setHeader('Access-Control-Allow-Origin', '*')
        self.request.response.setHeader('Cache-Control', 'no-cache, no-store')
        
        alsoProvides(self.request, IDisableCSRFProtection)
        qr_room_id = self.request.form.get('id', None)
        qr_minutes = int(self.request.form.get('minutes', 0))
        room_id = self.request.form.get('qr.room_id', '')
        start_str = self.request.form.get('qr.start', '')
        end_str = self.request.form.get('qr.end', '')
        qr_submit = self.request.form.get('qr.submit', '')
        
        
        if qr_submit != '' and room_id != '' and start_str != '' and end_str != '':
            start = datetime.datetime.strptime(start_str,'%Y-%m-%d %H:%M:%S') #2019-11-11 11:45:00
            end = datetime.datetime.strptime(end_str, '%Y-%m-%d %H:%M:%S') #2019-11-11 11:45:00
            self.add_event(room_id,'librarytechnology@uwosh.edu','Walk-in Reservation',start, end)
            return self.request.response.redirect(self.context.absolute_url())
        else:
            now = self.round_to_closest_15(datetime.datetime.now())
            self.data = self.does_time_fit(qr_room_id, now, qr_minutes)
            
        return self.template()


    def round_to_closest_15(self, currenttime):
        minute = currenttime.minute
        if minute >= 45:
            minute = 45
        elif minute >= 30:
            minute = 30
        elif minute >= 15:
            minute = 15
        elif minute >= 0:
            minute = 0
        currenttime = currenttime.replace(minute=minute, second=0, microsecond=0)
        return currenttime
        
    def does_time_fit(self,room_id, start_dt, minutes):
    
        
        end_dt = start_dt.replace(second=59, microsecond=59)
    
        data = {
            'unavailable': False,
            'fits': True,
            'start': start_dt.strftime('%Y-%m-%d %H:%M:%S'),
            'start_friendly_time': start_dt.strftime("%-I:%M %p"),
            'end': None,
            'end_friendly_time': end_dt.strftime("%-I:%M %p"),
            'room_id': room_id,
        }
        previous_check_dt = start_dt
        check_dt = start_dt
        brains = api.content.find(context=api.portal.get(), id=room_id, portal_type='polklibrary.groupfinder.models.room')
            
        if len(brains) == 1:
            obj = brains[0].getObject()
            cache = obj.cached
            if cache == None:
                cache = '{}'
            cache = json.loads(cache)
            
            # Check if start is in middle of reservation
            dtID = str(start_dt.strftime('%Y%m%d'))
            if dtID in cache:
                for e in cache[dtID]:
                    if int(time.mktime(start_dt.timetuple())) * 1000 >= int(e['start']) and int(time.mktime(end_dt.timetuple())) * 1000 < int(e['end']):
                        data['unavailable'] = True
                        data['fits'] = False
                        data['end'] = end_dt.strftime('%Y-%m-%d %H:%M:%S')
                        data['end_friendly_time'] = end_dt.strftime("%-I:%M %p")
                        return data

            # Check if range up to reservation
            for i in range(0, minutes, 15):
                previous_check_dt = check_dt
                check_dt = check_dt + datetime.timedelta(minutes=15)
                
                if dtID in cache:
                    for e in cache[dtID]:                    
                        if int(e['start']) == int(time.mktime(check_dt.timetuple())) * 1000:
                            data['fits'] = False
                            data['end'] = check_dt.strftime('%Y-%m-%d %H:%M:%S')
                            data['end_friendly_time'] = check_dt.strftime("%-I:%M %p")
                            return data

        data['end'] = check_dt.strftime('%Y-%m-%d %H:%M:%S')
        data['end_friendly_time'] = check_dt.strftime("%-I:%M %p")
        return data
                    


    # also exact in api.py
    def add_event(self,room_id,email,title,start,end):
        brains = api.content.find(context=api.portal.get(), id=room_id, portal_type='polklibrary.groupfinder.models.room')
        if len(brains) == 1:
            obj = brains[0].getObject()
            
            cache = obj.cached
            if cache == None:
                cache = '{}'
            cache = json.loads(cache)
            
            start_dt = start
            DateID = str(start_dt.strftime('%Y%m%d'))

            if DateID not in cache:
                cache[DateID] = []

            cache[DateID].append({
                'start' : int(time.mktime(start.timetuple())) * 1000,
                'end' : int(time.mktime(end.timetuple())) * 1000,
                'title' : title,
                'email' : email,
                'ip' : 'QR Reservation'
            })
            
            obj.cached = json.dumps(cache)
            obj.reindexObject()
                    

    @property
    def portal(self):
        return api.portal.get()
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
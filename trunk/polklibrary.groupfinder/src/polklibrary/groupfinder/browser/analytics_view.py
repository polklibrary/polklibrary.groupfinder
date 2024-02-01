
from plone import api
from Products.Five import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from zope.component import getUtility
from plone.registry.interfaces import IRegistry
import datetime,json,urllib


class AnalyticsView(BrowserView):

    template = ViewPageTemplateFile('analytics_view.pt')
    count_results = []
    
    def __call__(self):
    
        start = self.request.form.get('form.start', '')
        self.start_value = start
        end = self.request.form.get('form.end', '')
        self.end_value = end
        submit = self.request.form.get('form.submit', '')
        self.count_results = []
        if submit and start != '' and end != '':
            try:
                start_date = int(start.replace('-',''))
                end_date = int(end.replace('-','')) + 1
                
                if submit == 'Get Counts':
                    self.count_results = self.get_counts(start_date, end_date)
                if submit == 'Get Usage By Hour':
                    self.count_results = self.get_hours_usage(start_date, end_date)
                    
                    
            except Exception as e:
                pass
    
        return self.template()
        
        
    def get_hours_usage(self,start_date,end_date):
        results = []
        brains = api.content.find(context=api.portal.get(), portal_type='polklibrary.groupfinder.models.room', sort_on='getObjPositionInParent', sort_order='ascending')
        for brain in brains:
            obj = brain.getObject()
            cache = obj.cached
            if cache == None:
                cache = '{}'
            cache = json.loads(cache)
            
            data = {}
            for i in range(start_date, end_date):
                id = str(i)
                if id in cache:
                    for event in cache[id]:
                        start = datetime.datetime.fromtimestamp(event[u'start']/1000.0)
                        end = datetime.datetime.fromtimestamp(event[u'end']/1000.0)
                        for i in range(start.hour,end.hour):
                            if i in data:
                                data[i] += 1
                            else:
                                data[i] = 1
                                
            results.append({
                'Title' : brain.Title,
                'Hours': data,
            })
            
        return results
        
    def get_counts(self,start_date,end_date):
        results = []
        brains = api.content.find(context=api.portal.get(), portal_type='polklibrary.groupfinder.models.room', sort_on='getObjPositionInParent', sort_order='ascending')
        for brain in brains:
            obj = brain.getObject()
            
            cache = obj.cached
            if cache == None:
                cache = '{}'
            cache = json.loads(cache)
            
            counts = 0
            for i in range(start_date, end_date):
                id = str(i)
                if id in cache:
                    counts += len(cache[id])
            
            results.append({
                'Title' : brain.Title,
                'Counts': counts,
            })
        return results
        
    @property
    def portal(self):
        return api.portal.get()
        
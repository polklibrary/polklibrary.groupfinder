# from apiclient import discovery
# from httplib2 import Http
# from plone import api
# from Products.Five import BrowserView
# from oauth2client.service_account import ServiceAccountCredentials

# import datetime,json,urllib


# class GoogleAPI(BrowserView):

   
    # def __call__(self):
        # response = {}
        
        # if self.request.form.get('add','0') == '1':
            # response = self.add_event()
        # if self.request.form.get('delete','0') == '1':
            # pass
   
        # return json.dumps(response)
    
    
    # def add_event(self):
        # response = {
            # 'status' : 400,
            # 'response' : None,
        # }
        
        # try:
            # scopes = ['https://www.googleapis.com/auth/calendar']
            # credentials = ServiceAccountCredentials.from_json_keyfile_name(str(self.context.server_json_path), scopes=scopes)
            # http = credentials.authorize(Http())
            # service = discovery.build('calendar', 'v3', http=http)
            
            # result = service.events().insert(
                # calendarId = self.request.form.get('id',None), 
                # body = {
                    # 'summary': self.request.form.get('summary',''),
                    # 'description': 'User: ' + self.request.form.get('email', '') + '\nBrowser: '  + self.request.form.get('useragent', '') + '\nCreated: '  + self.request.form.get('created_on', ''),
                    # 'start': {
                        # 'dateTime': self.request.form.get('start',''),
                    # },
                    # 'end': {
                        # 'dateTime': self.request.form.get('end',''),
                    # },
                # }, 
                # sendNotifications=None, 
                # supportsAttachments=None, 
                # maxAttendees=None
            # ).execute()
            
            # response['status'] = 200
            # response['response'] = result
            
            # return response
        # except Exception as e:
            # import traceback
            # print(traceback.format_exc())
            # return response

            
    # @property
    # def portal(self):
        # return api.portal.get()
        
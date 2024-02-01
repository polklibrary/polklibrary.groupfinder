from plone import api
from plone.app.textfield import RichText
from plone.supermodel import model
from zope import schema

class IGroupFinder(model.Schema):

    title = schema.TextLine(
            title=u"Title",
            required=True,
        )

    description = schema.Text(
            title=u"Description",
            required=False,
        )
        
    banned = schema.Text(
            title=u"Banned NetIDs",
            description=u"One per line",
            required=False,
        )
        
    banned_words = schema.Text(
            title=u"Banned Words",
            description=u"One per line.  Mark spaces with an underscore _.  All checked as lowercase.",
            required=False,
        )

    client_id = schema.TextLine(
            title=u"Google Client ID (deprecated)",
            required=False,
        )
        
    api_key = schema.TextLine(
            title=u"Google API Key (deprecated)",
            required=False,
        )

    server_json_path = schema.TextLine(
            title=u"Server JSON Path (deprecated)",
            required=False,
        )
        
    google_delegated_account = schema.TextLine(
            title=u"Authorized Google Account (provide email) (deprecated)",
            description=u"Delegates authorization to this account for adding/removing events",
            required=False,
        )
        
    body = RichText(
            title=u"Information about GroupFinder",
            default_mime_type='text/structured',
            required=False,
            default=u"",
        )
          
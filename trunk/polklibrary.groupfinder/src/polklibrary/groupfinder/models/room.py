from plone import api
from plone.app.textfield import RichText
from plone.namedfile.field import NamedBlobImage
from plone.supermodel import model
from zope import schema
from zope.schema.vocabulary import SimpleVocabulary, SimpleTerm

timelimits = SimpleVocabulary([
    SimpleTerm(value=u'0', title=u'No limit'),
    SimpleTerm(value=u'1', title=u'1 hour'),
    SimpleTerm(value=u'1.5', title=u'1.5 hours'),
    SimpleTerm(value=u'2', title=u'2 hours'),
    SimpleTerm(value=u'2.5', title=u'2.5 hours'),
    SimpleTerm(value=u'3', title=u'3 hours'),
    SimpleTerm(value=u'3.5', title=u'3.5 hours'),
    SimpleTerm(value=u'4', title=u'4 hours'),
])

class IRoom(model.Schema):

    title = schema.TextLine(
            title=u"Room Name",
            required=True,
        )
        
    location = schema.TextLine(
            title=u"Location",
            required=False,
        )

    body = RichText(
            title=u"Information about the room",
            default_mime_type='text/structured',
            required=False,
            default=u"<p></p>",
        )
        
    image = NamedBlobImage(
            title=u"Room Image",
            required=False,
        )
        
    restrictions = schema.Choice(
            title=u"Time Restrictions",
            default=u"0",
            required=False,
            source=timelimits,
        )
        
    extra_css = schema.TextLine(
            title=u"CSS Classes to add",
            default=u"",
            required=False,
        )
        
    cached = schema.Text(
            title=u"Cached",
            description=u"DO NOT EDIT",
            required=False,
        )
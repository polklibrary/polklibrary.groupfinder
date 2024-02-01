# -*- coding: utf-8 -*-
from plone.app.contenttypes.testing import PLONE_APP_CONTENTTYPES_FIXTURE
from plone.app.robotframework.testing import REMOTE_LIBRARY_BUNDLE_FIXTURE
from plone.app.testing import applyProfile
from plone.app.testing import FunctionalTesting
from plone.app.testing import IntegrationTesting
from plone.app.testing import PloneSandboxLayer
from plone.testing import z2

import polklibrary.groupfinder


class PolklibraryGroupfinderLayer(PloneSandboxLayer):

    defaultBases = (PLONE_APP_CONTENTTYPES_FIXTURE,)

    def setUpZope(self, app, configurationContext):
        self.loadZCML(package=polklibrary.groupfinder)

    def setUpPloneSite(self, portal):
        applyProfile(portal, 'polklibrary.groupfinder:default')


POLKLIBRARY_GROUPFINDER_FIXTURE = PolklibraryGroupfinderLayer()


POLKLIBRARY_GROUPFINDER_INTEGRATION_TESTING = IntegrationTesting(
    bases=(POLKLIBRARY_GROUPFINDER_FIXTURE,),
    name='PolklibraryGroupfinderLayer:IntegrationTesting'
)


POLKLIBRARY_GROUPFINDER_FUNCTIONAL_TESTING = FunctionalTesting(
    bases=(POLKLIBRARY_GROUPFINDER_FIXTURE,),
    name='PolklibraryGroupfinderLayer:FunctionalTesting'
)


POLKLIBRARY_GROUPFINDER_ACCEPTANCE_TESTING = FunctionalTesting(
    bases=(
        POLKLIBRARY_GROUPFINDER_FIXTURE,
        REMOTE_LIBRARY_BUNDLE_FIXTURE,
        z2.ZSERVER_FIXTURE
    ),
    name='PolklibraryGroupfinderLayer:AcceptanceTesting'
)

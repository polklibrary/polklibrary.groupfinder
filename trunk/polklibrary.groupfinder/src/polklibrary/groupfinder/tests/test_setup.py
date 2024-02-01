# -*- coding: utf-8 -*-
"""Setup tests for this package."""
from polklibrary.groupfinder.testing import POLKLIBRARY_GROUPFINDER_INTEGRATION_TESTING  # noqa
from plone import api

import unittest


class TestSetup(unittest.TestCase):
    """Test that polklibrary.groupfinder is properly installed."""

    layer = POLKLIBRARY_GROUPFINDER_INTEGRATION_TESTING

    def setUp(self):
        """Custom shared utility setup for tests."""
        self.portal = self.layer['portal']
        self.installer = api.portal.get_tool('portal_quickinstaller')

    def test_product_installed(self):
        """Test if polklibrary.groupfinder is installed with portal_quickinstaller."""
        self.assertTrue(self.installer.isProductInstalled('polklibrary.groupfinder'))

    def test_browserlayer(self):
        """Test that IPolklibraryGroupfinderLayer is registered."""
        from polklibrary.groupfinder.interfaces import IPolklibraryGroupfinderLayer
        from plone.browserlayer import utils
        self.assertIn(IPolklibraryGroupfinderLayer, utils.registered_layers())


class TestUninstall(unittest.TestCase):

    layer = POLKLIBRARY_GROUPFINDER_INTEGRATION_TESTING

    def setUp(self):
        self.portal = self.layer['portal']
        self.installer = api.portal.get_tool('portal_quickinstaller')
        self.installer.uninstallProducts(['polklibrary.groupfinder'])

    def test_product_uninstalled(self):
        """Test if polklibrary.groupfinder is cleanly uninstalled."""
        self.assertFalse(self.installer.isProductInstalled('polklibrary.groupfinder'))

    def test_browserlayer_removed(self):
        """Test that IPolklibraryGroupfinderLayer is removed."""
        from polklibrary.groupfinder.interfaces import IPolklibraryGroupfinderLayer
        from plone.browserlayer import utils
        self.assertNotIn(IPolklibraryGroupfinderLayer, utils.registered_layers())

from plone import api
from sc.voltolighttheme import PACKAGE_NAME

import pytest


class TestHiddenProfiles:
    """The add-ons control panel should offer one thing: the add-on."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal) -> None:
        self.portal = portal
        self.non_installable = api.addon._get_non_installable_addons()

    def test_uninstall_profiles_hidden(self):
        """Uninstall profiles are reached through the add-on, not listed."""

        assert f"{PACKAGE_NAME}:uninstall" in self.non_installable.profiles

    def test_default_profile_stays_installable(self):
        """Hiding must not hide the profile people actually install."""
        assert f"{PACKAGE_NAME}:default" not in (self.non_installable.profiles)

    def test_upgrades_package_hidden(self):
        """The upgrades package is machinery, not a product."""
        assert f"{PACKAGE_NAME}.upgrades" in self.non_installable.products


class TestSetupInstall:
    def test_addon_installed(self, installer):
        """Test if sc.voltolighttheme is installed."""
        assert installer.is_product_installed(PACKAGE_NAME) is True

    def test_browserlayer(self, browser_layers):
        """Test that IBrowserLayer is registered."""
        from sc.voltolighttheme.interfaces import IBrowserLayer

        assert IBrowserLayer in browser_layers

    def test_latest_version(self, profile_last_version):
        """Test latest version of default profile."""
        assert profile_last_version(f"{PACKAGE_NAME}:default") == "1001"

    def test_no_dangling_upgrade_steps(self, installer):
        """Test that there are no dangling upgrade steps."""
        upgrade_info = installer.upgrade_info(PACKAGE_NAME)
        assert upgrade_info["available"] is False

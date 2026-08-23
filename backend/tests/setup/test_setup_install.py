from plone import api
from sc.voltolighttheme import PACKAGE_NAME

import pytest


class TestHiddenProfiles:
    """The add-ons control panel should offer one thing: the add-on."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal) -> None:
        self.portal = portal
        self.non_installable = api.addon._get_non_installable_addons()

    @pytest.mark.parametrize(
        "profile,reason",
        [
            (
                f"{PACKAGE_NAME}:uninstall",
                "Uninstall profiles are reached through the add-on, not listed.",
            ),
            (
                "kitconcept.voltolighttheme:default",
                "kitconcept.voltolighttheme profiles should not be listed.",
            ),
            (
                "kitconcept.voltolighttheme:uninstall",
                "kitconcept.voltolighttheme profiles should not be listed.",
            ),
        ],
    )
    def test_hidden_profiles(self, profile: str, reason: str):
        """Uninstall profiles are reached through the add-on, not listed."""

        assert profile in self.non_installable.profiles, (
            f"{profile} should be hidden: {reason}"
        )

    def test_default_profile_stays_installable(self):
        """Hiding must not hide the profile people actually install."""
        assert f"{PACKAGE_NAME}:default" not in (self.non_installable.profiles)

    @pytest.mark.parametrize(
        "package,reason",
        [
            (
                "kitconcept.voltolighttheme",
                "kitconcept.voltolighttheme should not be listed.",
            ),
            (
                f"{PACKAGE_NAME}.upgrades",
                "The upgrades package is machinery, not a product.",
            ),
        ],
    )
    def test_package_hidden(self, package: str, reason: str):
        """The upgrades package is machinery, not a product."""
        assert package in self.non_installable.products, (
            f"{package} should be hidden: {reason}"
        )


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

from sc.voltolighttheme import PACKAGE_NAME
from typing import Any

import pytest


class TestRegistrySettings:
    """Test registry settings."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal_class):
        """Setup the portal for registry settings tests."""
        self.portal = portal_class

    @pytest.mark.parametrize(
        "record,oper,expected",
        [
            ("plone.displayed_types", "in", "Link"),
            ("plone.displayed_types", "in", "Folder"),
            ("plone.displayed_types", "in", "Collection"),
            ("plone.displayed_types", "in", "Document"),
        ],
    )
    def test_registry_portal_settings(
        self, registry_checker, record: str, oper: str, expected: Any
    ):
        """Test registry settings."""
        registry_checker(record, oper, expected)


class TestRegistryThemeSettings:
    """Test registry theme settings for default profile."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal_class):
        """Setup the portal for registry settings tests."""
        self.portal = portal_class

    @pytest.mark.parametrize(
        "theme,key,expected",
        [
            ("default", "name", "Default"),
            ("default", "description", "The theme shipped with sc.voltolighttheme."),
        ],
    )
    def test_registry_theme_settings(
        self, registry_checker, theme: str, key: str, expected: str
    ):
        """Test theme settings."""
        oper = "eq"
        record = f"sc.voltolighttheme.theme.{theme}.{key}"
        registry_checker(record, oper, expected)


@pytest.mark.portal(profiles=[f"{PACKAGE_NAME}:initial"])
class TestRegistryThemeSettingsInitial:
    """Test registry theme settings for initial profile."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal_class):
        """Setup the portal for registry settings tests."""
        self.portal = portal_class

    @pytest.mark.parametrize(
        "theme,key,expected",
        [
            ("natal", "name", "Natal"),
            (
                "natal",
                "description",
                "A festive theme with Inter typography and rounded borders.",
            ),
        ],
    )
    def test_registry_theme_settings(
        self, registry_checker, theme: str, key: str, expected: str
    ):
        """Test theme settings."""
        oper = "eq"
        record = f"sc.voltolighttheme.theme.{theme}.{key}"
        registry_checker(record, oper, expected)

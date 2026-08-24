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
            ("default", "font_family_primary", "Inter, sans-serif"),
            ("default", "font_family_secondary", "Inter, sans-serif"),
            ("default", "primary_color_light", "#ffffff"),
            ("default", "primary_color_dark", "#000000"),
            ("default", "primary_foreground_color_light", "#000000"),
            ("default", "primary_foreground_color_dark", "#ffffff"),
            ("default", "primary_low_foreground_color_light", "#333333"),
            ("default", "primary_low_foreground_color_dark", "#f8f8f8"),
            ("default", "primary_accent_color_light", "#b55e1c"),
            ("default", "primary_accent_color_dark", "#f4822c"),
            ("default", "secondary_color_light", "#000000"),
            ("default", "secondary_color_dark", "#ffffff"),
            ("default", "secondary_foreground_color_light", "#ffffff"),
            ("default", "secondary_foreground_color_dark", "#000000"),
            ("default", "secondary_low_foreground_color_light", "#e6e6e6"),
            ("default", "secondary_low_foreground_color_dark", "#333333"),
            ("default", "secondary_accent_color_light", "#f4822c"),
            ("default", "secondary_accent_color_dark", "#f4822c"),
            ("default", "accent_color_light", "#f4822c"),
            ("default", "accent_color_dark", "#b55e1c"),
            ("default", "accent_foreground_color_light", "#000000"),
            ("default", "accent_foreground_color_dark", "#ffffff"),
            ("default", "accent_low_foreground_color_light", "#333333"),
            ("default", "accent_low_foreground_color_dark", "#f8f8f8"),
            ("default", "accent_accent_color_light", "#000000"),
            ("default", "accent_accent_color_dark", "#ffffff"),
            ("default", "neutral_color_light", "#edeff0"),
            ("default", "neutral_color_dark", "#333333"),
            ("default", "neutral_foreground_color_light", "#000000"),
            ("default", "neutral_foreground_color_dark", "#ffffff"),
            ("default", "neutral_low_foreground_color_light", "#333333"),
            ("default", "neutral_low_foreground_color_dark", "#e6e6e6"),
            ("default", "neutral_accent_color_light", "#f4822c"),
            ("default", "neutral_accent_color_dark", "#f4822c"),
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
    """Test registry theme settings for default profile."""

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
                "Um tema festivo com tipografia Inter e bordas arredondadas.",
            ),
            ("natal", "font_family_primary", "Inter, sans-serif"),
            ("natal", "font_family_secondary", "Inter, sans-serif"),
            ("natal", "primary_color_light", "#d32f2f"),
            ("natal", "primary_color_dark", "#b71c1c"),
            ("natal", "primary_foreground_color_light", "#ffffff"),
            ("natal", "primary_foreground_color_dark", "#ffffff"),
            ("natal", "primary_low_foreground_color_light", "#ffcdd2"),
            ("natal", "primary_low_foreground_color_dark", "#ffcdd2"),
            ("natal", "primary_accent_color_light", "#fbc02d"),
            ("natal", "primary_accent_color_dark", "#fbc02d"),
            ("natal", "secondary_color_light", "#2e7d32"),
            ("natal", "secondary_color_dark", "#1b5e20"),
            ("natal", "secondary_foreground_color_light", "#ffffff"),
            ("natal", "secondary_foreground_color_dark", "#ffffff"),
            ("natal", "secondary_low_foreground_color_light", "#c8e6c9"),
            ("natal", "secondary_low_foreground_color_dark", "#c8e6c9"),
            ("natal", "secondary_accent_color_light", "#fbc02d"),
            ("natal", "secondary_accent_color_dark", "#fbc02d"),
            ("natal", "accent_color_light", "#fbc02d"),
            ("natal", "accent_color_dark", "#f57f17"),
            ("natal", "accent_foreground_color_light", "#000000"),
            ("natal", "accent_foreground_color_dark", "#000000"),
            ("natal", "accent_low_foreground_color_light", "#fff9c4"),
            ("natal", "accent_low_foreground_color_dark", "#fff9c4"),
            ("natal", "accent_accent_color_light", "#d32f2f"),
            ("natal", "accent_accent_color_dark", "#d32f2f"),
            ("natal", "neutral_color_light", "#f5f5f5"),
            ("natal", "neutral_color_dark", "#212121"),
            ("natal", "neutral_foreground_color_light", "#000000"),
            ("natal", "neutral_foreground_color_dark", "#ffffff"),
            ("natal", "neutral_low_foreground_color_light", "#757575"),
            ("natal", "neutral_low_foreground_color_dark", "#9e9e9e"),
            ("natal", "neutral_accent_color_light", "#d32f2f"),
            ("natal", "neutral_accent_color_dark", "#d32f2f"),
        ],
    )
    def test_registry_theme_settings(
        self, registry_checker, theme: str, key: str, expected: str
    ):
        """Test theme settings."""
        oper = "eq"
        record = f"sc.voltolighttheme.theme.{theme}.{key}"
        registry_checker(record, oper, expected)

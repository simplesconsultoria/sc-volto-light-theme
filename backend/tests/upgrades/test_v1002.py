"""Upgrade 1001 -> 1002: per-colour theme records become Color Groups."""

from plone.registry import field
from plone.registry import Record
from plone.registry.interfaces import IRegistry
from sc.voltolighttheme.upgrades.v1002 import migrate_themes_to_color_groups
from sc.voltolighttheme.utils import legacy_themes
from sc.voltolighttheme.utils import themes
from zope.component import getUtility

import pytest


#: A theme as 1.0.0a14 stored it: one record per colour.
LEGACY_THEME = {
    "name": "Corporate",
    "font_family_primary": "Roboto, sans-serif",
    "font_family_secondary": "Merriweather, serif",
    "primary_color_light": "#ffffff",
    "primary_color_dark": "#000000",
    "primary_foreground_color_light": "#000000",
    "primary_foreground_color_dark": "#ffffff",
    "primary_low_foreground_color_light": "#333333",
    "primary_low_foreground_color_dark": "#f8f8f8",
    "primary_accent_color_light": "#b55e1c",
    "primary_accent_color_dark": "#f4822c",
    "secondary_color_light": "#000000",
    "accent_color_light": "#f4822c",
    "neutral_color_light": "#edeff0",
    "event_color_light": "#d32f2f",
}

THEME_ID = "corporate"


def plant_legacy_theme(registry, theme_id: str = THEME_ID) -> None:
    for name, value in LEGACY_THEME.items():
        registry.records[themes.record_name(theme_id, name)] = Record(
            field.TextLine(required=False), value
        )


class TestLegacyThemeBeforeUpgrade:
    """New code, upgrade not run yet: the site must look the same."""

    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.registry = getUtility(IRegistry)
        plant_legacy_theme(self.registry)

    def test_theme_is_listed(self):
        assert THEME_ID in themes.theme_ids(self.registry)

    def test_color_groups_come_from_the_old_records(self):
        groups = themes.get_theme_color_groups(THEME_ID, self.registry)
        assert groups["primary"]["accent_color_light"] == "#b55e1c"
        assert groups["primary"]["background_color_dark"] == "#000000"
        assert groups["secondary"]["background_color_light"] == "#000000"
        assert groups["primary"]["font_family"] == "Roboto, sans-serif"

    def test_settings_keep_the_passthrough_fields(self):
        settings = themes.theme_settings(THEME_ID, self.registry)
        assert settings["font_family_secondary"] == "Merriweather, serif"
        assert settings["event_color_light"] == "#d32f2f"
        assert settings["color_groups"]["accent"]["background_color_light"] == (
            "#f4822c"
        )

    def test_update_accepts_old_fields(self):
        themes.update_theme(
            THEME_ID, {"primary_accent_color_light": "#123456"}, self.registry
        )
        groups = themes.get_theme_color_groups(THEME_ID, self.registry)
        assert groups["primary"]["accent_color_light"] == "#123456"
        # the rest of the old colours survive the write
        assert groups["primary"]["background_color_dark"] == "#000000"

    def test_update_writes_passthrough_fields(self):
        themes.update_theme(THEME_ID, {"event_color_light": "#00ff00"}, self.registry)
        settings = themes.theme_settings(THEME_ID, self.registry)
        assert settings["event_color_light"] == "#00ff00"

    def test_delete_removes_old_records_too(self):
        themes.delete_theme(THEME_ID, self.registry)
        assert THEME_ID not in themes.theme_ids(self.registry)


class TestUpgradeStep:
    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.portal = integration["portal"]
        self.registry = getUtility(IRegistry)
        plant_legacy_theme(self.registry)
        self.setup_tool = self.portal.portal_setup
        migrate_themes_to_color_groups(self.setup_tool)

    def test_colours_are_stored_as_color_groups(self):
        stored = self.registry[themes.record_name(THEME_ID, "color_groups")]
        assert stored["primary"]["accent_color_light"] == "#b55e1c"
        assert stored["neutral"]["background_color_light"] == "#edeff0"

    def test_migrated_records_are_removed(self):
        for name in legacy_themes.LEGACY_MIGRATED_FIELDS:
            assert themes.record_name(THEME_ID, name) not in self.registry.records

    def test_passthrough_records_are_kept(self):
        rec = themes.record_name(THEME_ID, "font_family_secondary")
        assert self.registry[rec] == "Merriweather, serif"

    def test_block_themes_are_registered(self):
        bts = themes.get_theme_block_themes(THEME_ID, self.registry)
        assert {"default", "alternative"} <= set(bts)

    def test_is_idempotent(self):
        before = themes.theme_values(THEME_ID, self.registry)
        migrate_themes_to_color_groups(self.setup_tool)
        assert themes.theme_values(THEME_ID, self.registry) == before

    def test_default_theme_is_untouched(self):
        # Installed by this version's profile: nothing to migrate.
        assert themes.migrate_legacy_theme(themes.DEFAULT_THEME_ID, self.registry) is (
            False
        )

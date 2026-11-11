"""Profiles written for 1.0.0a14 and earlier keep installing.

Projects such as the PortalBrasil Intranet ship their own theme in a
``registry.xml`` naming ``ISCVLTThemeDefinition`` with the old per-colour
fields. On a new site those records do not exist yet, so the import needs the
fields on the interface, or it raises ``ValueError``.
"""

from plone.app.registry.exportimport.handler import RegistryImporter
from plone.registry.interfaces import IRegistry
from sc.voltolighttheme.utils import themes
from zope.component import getUtility

import logging
import pytest


LEGACY_XML = b"""<?xml version="1.0" encoding="utf-8"?>
<registry>
  <records interface="sc.voltolighttheme.interfaces.ISCVLTThemeDefinition"
           prefix="sc.voltolighttheme.theme.legacy">
    <value key="name">Legacy</value>
    <value key="description">Written for 1.0.0a5.</value>
    <value key="font_family_primary">Rawline, sans-serif</value>
    <value key="font_family_secondary">Rawline, sans-serif</value>
    <value key="primary_color_light">#ffffff</value>
    <value key="primary_accent_color_light">#009c3b</value>
    <value key="accent_color_light">#ffe122</value>
    <value key="neutral_color_light">#edeff0</value>
  </records>
</registry>
"""


class _Environ:
    """The bits of a GenericSetup import context the importer uses."""

    def getLogger(self, name):
        return logging.getLogger(name)

    def shouldPurge(self):
        return False


@pytest.fixture
def imported(portal):
    registry = getUtility(IRegistry)
    RegistryImporter(registry, _Environ()).importDocument(LEGACY_XML)
    return registry


class TestLegacyProfileXml:
    def test_imports_on_a_new_site(self, imported):
        assert imported["sc.voltolighttheme.theme.legacy.name"] == "Legacy"

    def test_old_colours_become_color_groups(self, imported):
        groups = themes.get_theme_color_groups("legacy", imported)
        assert groups["primary"]["accent_color_light"] == "#009c3b"
        assert groups["accent"]["background_color_light"] == "#ffe122"
        assert groups["neutral"]["background_color_light"] == "#edeff0"
        assert groups["primary"]["font_family"] == "Rawline, sans-serif"

    def test_theme_is_listed(self, imported):
        assert "legacy" in themes.theme_ids(imported)

    def test_served_values_carry_groups_not_old_colours(self, imported):
        values = themes.theme_values("legacy", imported)
        assert "primary_accent_color_light" not in values
        assert values["color_groups"]["primary"]["accent_color_light"] == "#009c3b"
        # No Color Group equivalent: still served for the CSS that reads it.
        assert values["font_family_secondary"] == "Rawline, sans-serif"

    def test_form_schema_has_no_old_fields(self):
        assert themes.theme_field_names() == [
            "name",
            "description",
            "color_groups",
            "block_themes",
        ]

    def test_upgrade_migrates_the_imported_theme(self, imported):
        assert themes.migrate_legacy_theme("legacy", imported)
        assert (
            "sc.voltolighttheme.theme.legacy.primary_accent_color_light"
            not in imported.records
        )
        groups = themes.get_theme_color_groups("legacy", imported)
        assert groups["primary"]["accent_color_light"] == "#009c3b"

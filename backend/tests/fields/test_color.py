"""Color must survive a round-trip through plone.registry.

This is the gate for the whole theming feature: every theme is a set of
registry records created with ``registerInterface``, which refuses any field
without a persistent equivalent.
"""

from plone.registry.interfaces import IPersistentField
from plone.registry.interfaces import IRegistry
from sc.voltolighttheme.fields import Color
from sc.voltolighttheme.fields import PersistentColor
from sc.voltolighttheme.fields.color import InvalidColor
from sc.voltolighttheme.interfaces import ISCVLTThemeDefinition
from zope.component import getUtility

import pytest


PREFIX = "sc.voltolighttheme.theme.test-theme"


class TestColorPersistence:
    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.portal = integration["portal"]
        self.registry = getUtility(IRegistry)

    def test_color_adapts_to_persistent_field(self):
        field = Color(title="Primary color", required=False)
        persistent = IPersistentField(field)
        assert isinstance(persistent, PersistentColor)

    def test_persistent_color_keeps_the_field_configuration(self):
        field = Color(title="Primary color", description="Hex", required=False)
        persistent = IPersistentField(field)
        assert persistent.title == "Primary color"
        assert persistent.description == "Hex"
        assert persistent.required is False

    def test_persistent_color_is_already_persistent(self):
        field = PersistentColor(title="Primary color")
        assert IPersistentField(field) is field

    def test_persistent_color_still_validates(self):
        field = PersistentColor(title="Primary color", required=False)
        field.validate("#abc123")
        with pytest.raises(InvalidColor):
            field.validate("not-a-color")

    def test_register_theme_interface(self):
        """The call that used to raise TypeError."""
        self.registry.registerInterface(ISCVLTThemeDefinition, prefix=PREFIX)
        assert f"{PREFIX}.primary_color_light" in self.registry.records

    def test_color_value_round_trips(self):
        self.registry.registerInterface(ISCVLTThemeDefinition, prefix=PREFIX)
        self.registry[f"{PREFIX}.primary_color_light"] = "#0a4a7a"
        assert self.registry[f"{PREFIX}.primary_color_light"] == "#0a4a7a"

    def test_registry_rejects_an_invalid_color(self):
        self.registry.registerInterface(ISCVLTThemeDefinition, prefix=PREFIX)
        with pytest.raises(InvalidColor):
            self.registry[f"{PREFIX}.primary_color_light"] = "banana"

    def test_every_theme_field_is_registered(self):
        self.registry.registerInterface(ISCVLTThemeDefinition, prefix=PREFIX)
        for name in (
            "name",
            "description",
            "primary_color_light",
            "accent_color_light",
        ):
            assert f"{PREFIX}.{name}" in self.registry.records

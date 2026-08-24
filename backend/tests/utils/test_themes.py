"""Enumeration and CRUD helpers over theme records in the registry."""

from plone.registry import field
from plone.registry import Record
from plone.registry.interfaces import IRegistry
from sc.voltolighttheme.fields.color import InvalidColor
from sc.voltolighttheme.utils import themes
from zope.component import getUtility

import pytest


class TestThemeUtils:
    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.portal = integration["portal"]
        self.registry = getUtility(IRegistry)

    def test_default_theme_is_installed(self):
        assert themes.DEFAULT_THEME_ID in themes.theme_ids(self.registry)

    def test_default_theme_carries_its_colors(self):
        values = themes.theme_values(themes.DEFAULT_THEME_ID, self.registry)
        assert values["name"] == "Default"
        assert values["primary_color_light"] == "#ffffff"

    def test_theme_field_names_come_from_the_schema(self):
        names = themes.theme_field_names()
        assert "name" in names
        assert "primary_color_light" in names
        assert "accent_foreground_color_light" in names

    @pytest.mark.parametrize(
        "theme_id,expected",
        (
            ("corporate", True),
            ("theme-2", True),
            ("t", True),
            ("has.dot", False),
            ("-leading-dash", False),
            ("UPPER", False),
            ("with space", False),
            ("", False),
        ),
    )
    def test_is_valid_theme_id(self, theme_id: str, expected: bool):
        assert themes.is_valid_theme_id(theme_id) is expected

    def test_record_name(self):
        assert (
            themes.record_name("corporate", "primary_color_light")
            == "sc.voltolighttheme.theme.corporate.primary_color_light"
        )

    def test_theme_exists(self):
        assert themes.theme_exists(themes.DEFAULT_THEME_ID, self.registry) is True
        assert themes.theme_exists("not-here", self.registry) is False

    def test_theme_values_includes_the_metadata(self):
        # The control panel edits the whole record, so it needs these.
        values = themes.theme_values(themes.DEFAULT_THEME_ID, self.registry)
        assert values["name"] == "Default"
        assert "description" in values

    def test_theme_settings_excludes_the_metadata(self):
        # Every key of this dict becomes a CSS custom property.
        settings = themes.theme_settings(themes.DEFAULT_THEME_ID, self.registry)
        assert "name" not in settings
        assert "description" not in settings

    def test_theme_settings_keeps_every_style_field(self):
        # Defined by exclusion, so a style field added to the schema is picked
        # up without touching `theme_settings`.
        settings = themes.theme_settings(themes.DEFAULT_THEME_ID, self.registry)
        assert set(settings) == set(themes.theme_field_names()) - set(
            themes.THEME_METADATA_FIELDS
        )

    def test_theme_settings_of_a_missing_theme_is_empty(self):
        assert themes.theme_settings("not-here", self.registry) == {}

    def test_theme_values_of_a_missing_theme_is_empty(self):
        assert themes.theme_values("not-here", self.registry) == {}

    def test_theme_title_falls_back_to_the_id(self):
        themes.create_theme("untitled", registry=self.registry)
        assert themes.theme_title("untitled", self.registry) == "untitled"

    def test_theme_title_uses_the_name(self):
        assert themes.theme_title(themes.DEFAULT_THEME_ID, self.registry) == "Default"

    def test_records_outside_the_prefix_are_ignored(self):
        assert all("." not in tid for tid in themes.theme_ids(self.registry))

    def test_a_prefix_record_without_a_field_part_is_ignored(self):
        # `sc.voltolighttheme.theme.<x>` with no further dot is not a theme
        # record; treating it as one would invent the id `<x>`. Only the
        # `<theme-id>.<field-name>` shape counts.
        record = Record(field.TextLine(title="Stray"), "value")
        self.registry.records[f"{themes.PREFIX}.stray"] = record

        assert "stray" in [
            name[len(themes.PREFIX) + 1 :]
            for name in self.registry.records
            if name.startswith(f"{themes.PREFIX}.")
        ]
        assert "stray" not in themes.theme_ids(self.registry)

    class TestCreate:
        @pytest.fixture(autouse=True)
        def _setup(self, integration):
            self.registry = getUtility(IRegistry)

        def test_create_registers_every_field(self):
            themes.create_theme("corporate", registry=self.registry)
            for name in themes.theme_field_names():
                assert themes.record_name("corporate", name) in self.registry.records

        def test_create_stores_the_given_values(self):
            values = themes.create_theme(
                "corporate",
                {"name": "Corporate", "primary_color_light": "#123456"},
                registry=self.registry,
            )
            assert values["name"] == "Corporate"
            assert values["primary_color_light"] == "#123456"

        def test_create_shows_up_in_the_listing(self):
            themes.create_theme("corporate", registry=self.registry)
            assert "corporate" in themes.theme_ids(self.registry)

        def test_create_rejects_a_dotted_id(self):
            with pytest.raises(ValueError, match="Invalid theme id"):
                themes.create_theme("has.dot", registry=self.registry)

        def test_create_rejects_a_duplicate(self):
            themes.create_theme("corporate", registry=self.registry)
            with pytest.raises(ValueError, match="already exists"):
                themes.create_theme("corporate", registry=self.registry)

        def test_create_rejects_an_invalid_color(self):
            with pytest.raises(InvalidColor):
                themes.create_theme(
                    "corporate",
                    {"primary_color_light": "banana"},
                    registry=self.registry,
                )

    class TestUpdate:
        @pytest.fixture(autouse=True)
        def _setup(self, integration):
            self.registry = getUtility(IRegistry)
            themes.create_theme(
                "corporate",
                {"name": "Corporate", "primary_color_light": "#123456"},
                registry=self.registry,
            )

        def test_update_writes_the_given_field(self):
            themes.update_theme(
                "corporate", {"primary_color_light": "#abcdef"}, registry=self.registry
            )
            values = themes.theme_values("corporate", self.registry)
            assert values["primary_color_light"] == "#abcdef"

        def test_update_is_partial(self):
            themes.update_theme(
                "corporate", {"primary_color_light": "#abcdef"}, registry=self.registry
            )
            assert themes.theme_values("corporate", self.registry)["name"] == (
                "Corporate"
            )

        def test_update_ignores_unknown_keys(self):
            themes.update_theme(
                "corporate", {"not_a_field": "x"}, registry=self.registry
            )
            assert "not_a_field" not in themes.theme_values("corporate", self.registry)

        def test_update_of_a_missing_theme_raises(self):
            with pytest.raises(KeyError):
                themes.update_theme("not-here", {"name": "X"}, registry=self.registry)

    class TestDelete:
        @pytest.fixture(autouse=True)
        def _setup(self, integration):
            self.registry = getUtility(IRegistry)
            themes.create_theme("corporate", registry=self.registry)

        def test_delete_removes_every_record(self):
            themes.delete_theme("corporate", registry=self.registry)
            for name in themes.theme_field_names():
                assert (
                    themes.record_name("corporate", name) not in self.registry.records
                )

        def test_delete_removes_it_from_the_listing(self):
            themes.delete_theme("corporate", registry=self.registry)
            assert "corporate" not in themes.theme_ids(self.registry)

        def test_delete_leaves_other_themes_alone(self):
            themes.delete_theme("corporate", registry=self.registry)
            assert themes.DEFAULT_THEME_ID in themes.theme_ids(self.registry)

        def test_the_default_theme_cannot_be_deleted(self):
            with pytest.raises(ValueError, match="default theme cannot be deleted"):
                themes.delete_theme(themes.DEFAULT_THEME_ID, registry=self.registry)

        def test_the_default_theme_survives_the_attempt(self):
            with pytest.raises(ValueError):
                themes.delete_theme(themes.DEFAULT_THEME_ID, registry=self.registry)
            assert themes.theme_exists(themes.DEFAULT_THEME_ID, self.registry)

        def test_delete_of_a_missing_theme_raises(self):
            with pytest.raises(KeyError):
                themes.delete_theme("not-here", registry=self.registry)

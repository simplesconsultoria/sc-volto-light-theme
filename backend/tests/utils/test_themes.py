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
        assert "color_groups" in values
        assert "block_themes" in values

    def test_theme_field_names_come_from_the_schema(self):
        names = themes.theme_field_names()
        assert set(names) == {"name", "description", "color_groups", "block_themes"}

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
            themes.record_name("corporate", "color_groups")
            == "sc.voltolighttheme.theme.corporate.color_groups"
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
                {"name": "Corporate", "description": "Corp desc"},
                registry=self.registry,
            )
            assert values["name"] == "Corporate"
            assert values["description"] == "Corp desc"

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

    class TestUpdate:
        @pytest.fixture(autouse=True)
        def _setup(self, integration):
            self.registry = getUtility(IRegistry)
            themes.create_theme(
                "corporate",
                {"name": "Corporate", "description": "Initial desc"},
                registry=self.registry,
            )

        def test_update_writes_the_given_field(self):
            themes.update_theme(
                "corporate", {"description": "Updated desc"}, registry=self.registry
            )
            values = themes.theme_values("corporate", self.registry)
            assert values["description"] == "Updated desc"

        def test_update_is_partial(self):
            themes.update_theme(
                "corporate", {"description": "Updated desc"}, registry=self.registry
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

    class TestColorGroupsAndBlockThemes:
        @pytest.fixture(autouse=True)
        def _setup(self, integration):
            self.registry = getUtility(IRegistry)
            themes.create_theme(
                "natal",
                {"name": "Natal"},
                registry=self.registry,
            )

        def test_default_color_groups_exist_on_all_themes(self):
            default_groups = themes.get_theme_color_groups(themes.DEFAULT_THEME_ID, self.registry)
            assert "primary" in default_groups
            assert "secondary" in default_groups
            assert "accent" in default_groups
            assert "neutral" in default_groups

            natal_groups = themes.get_theme_color_groups("natal", self.registry)
            assert natal_groups["primary"]["name"] == "Primary"

        def test_create_color_group_syncs_to_other_themes_with_defaults(self):
            # When a new color group 'vermelho' is created in 'natal':
            new_group = {
                "id": "vermelho",
                "name": "Vermelho",
                "font_family": "Inter, sans-serif",
                "background_color_light": "#ff0000",
                "background_color_dark": "#990000",
                "text_color_light": "#ffffff",
                "text_color_dark": "#ffffff",
                "subtext_color_light": "#ffcccc",
                "subtext_color_dark": "#ffcccc",
                "accent_color_light": "#ffd700",
                "accent_color_dark": "#ffd700",
            }
            themes.create_color_group("natal", new_group, registry=self.registry)

            # Natal must have 'vermelho' with custom colors
            natal_groups = themes.get_theme_color_groups("natal", self.registry)
            assert "vermelho" in natal_groups
            assert natal_groups["vermelho"]["background_color_light"] == "#ff0000"

            # Default theme must automatically receive 'vermelho' with default fallback values
            default_groups = themes.get_theme_color_groups(themes.DEFAULT_THEME_ID, self.registry)
            assert "vermelho" in default_groups
            assert default_groups["vermelho"]["name"] == "Vermelho"
            assert default_groups["vermelho"]["background_color_light"] == "#ffffff"

        def test_create_block_theme_syncs_across_themes(self):
            new_bt = {
                "id": "destaque",
                "name": "Destaque",
                "back_color_group": "accent",
                "front_color_group": "neutral",
            }
            themes.create_block_theme("natal", new_bt, registry=self.registry)

            natal_bts = themes.get_theme_block_themes("natal", self.registry)
            assert "destaque" in natal_bts
            assert natal_bts["destaque"]["back_color_group"] == "accent"

            default_bts = themes.get_theme_block_themes(themes.DEFAULT_THEME_ID, self.registry)
            assert "destaque" in default_bts
            assert default_bts["destaque"]["back_color_group"] == "accent"

        def test_theme_values_and_settings_include_color_groups_and_block_themes(self):
            values = themes.theme_values(themes.DEFAULT_THEME_ID, self.registry)
            assert "color_groups" in values
            assert "block_themes" in values

            settings = themes.theme_settings(themes.DEFAULT_THEME_ID, self.registry)
            assert "color_groups" in settings
            assert "block_themes" in settings

        def test_cannot_delete_base_color_group(self):
            for bg in ("primary", "secondary", "accent", "neutral"):
                with pytest.raises(ValueError, match="Base color group .* cannot be deleted"):
                    themes.delete_color_group(themes.DEFAULT_THEME_ID, bg, registry=self.registry)

        def test_cannot_delete_base_block_theme(self):
            for bt in ("default", "alternative"):
                with pytest.raises(ValueError, match="Base block theme .* cannot be deleted"):
                    themes.delete_block_theme(themes.DEFAULT_THEME_ID, bt, registry=self.registry)

        def test_delete_custom_block_theme_cascades(self):
            custom_bt = {
                "id": "promocional",
                "name": "Promocional",
                "back_color_group": "accent",
                "front_color_group": "primary",
            }
            themes.create_block_theme("natal", custom_bt, registry=self.registry)
            assert "promocional" in themes.get_theme_block_themes("natal", self.registry)
            assert "promocional" in themes.get_theme_block_themes(themes.DEFAULT_THEME_ID, self.registry)

            themes.delete_block_theme("natal", "promocional", registry=self.registry)
            assert "promocional" not in themes.get_theme_block_themes("natal", self.registry)
            assert "promocional" not in themes.get_theme_block_themes(themes.DEFAULT_THEME_ID, self.registry)

        def test_delete_custom_color_group_cascades_and_reverts_block_themes(self):
            custom_group = {
                "id": "roxo",
                "name": "Roxo",
                "font_family": "Inter, sans-serif",
                "background_color_light": "#7b1fa2",
                "background_color_dark": "#4a148c",
                "text_color_light": "#ffffff",
                "text_color_dark": "#ffffff",
                "subtext_color_light": "#e1bee7",
                "subtext_color_dark": "#e1bee7",
                "accent_color_light": "#ff4081",
                "accent_color_dark": "#ff4081",
            }
            themes.create_color_group("natal", custom_group, registry=self.registry)

            # Create block theme that uses 'roxo' as back_color_group
            custom_bt = {
                "id": "roxo-card",
                "name": "Roxo Card",
                "back_color_group": "roxo",
                "front_color_group": "neutral",
            }
            themes.create_block_theme("natal", custom_bt, registry=self.registry)

            assert "roxo" in themes.get_theme_color_groups("natal", self.registry)
            assert "roxo" in themes.get_theme_color_groups(themes.DEFAULT_THEME_ID, self.registry)
            assert themes.get_theme_block_themes("natal", self.registry)["roxo-card"]["back_color_group"] == "roxo"

            # Delete 'roxo'
            themes.delete_color_group("natal", "roxo", registry=self.registry)

            # Verified deleted in both themes
            assert "roxo" not in themes.get_theme_color_groups("natal", self.registry)
            assert "roxo" not in themes.get_theme_color_groups(themes.DEFAULT_THEME_ID, self.registry)

            # Block theme back_color_group must have reverted to 'primary'
            assert themes.get_theme_block_themes("natal", self.registry)["roxo-card"]["back_color_group"] == "primary"

    def test_natal_theme_has_christmas_colors(self):
        natal_cgs = themes.default_color_groups_for_theme("natal")
        assert natal_cgs["accent"]["background_color_light"] == "#c41e3a"
        assert natal_cgs["secondary"]["background_color_light"] == "#165b33"
        natal_bts = themes.get_theme_block_themes("natal", self.registry)
        assert "alternative" in natal_bts
        assert "festivo" not in natal_bts




"""Mapping of the pre-Color-Group theme fields onto Color Groups."""

from sc.voltolighttheme.utils import legacy_themes
from sc.voltolighttheme.utils.themes import DEFAULT_COLOR_GROUPS


class TestLegacyFields:
    def test_every_old_colour_field_is_mapped(self):
        # 4 groups x 4 roles x 2 modes, as on ISCVLTThemeDefinition up to 1.0.0a14
        assert len(legacy_themes.LEGACY_COLOR_FIELDS) == 32

    def test_roles_map_onto_color_group_keys(self):
        fields = legacy_themes.LEGACY_COLOR_FIELDS
        assert fields["primary_color_light"] == ("primary", "background_color_light")
        assert fields["secondary_foreground_color_dark"] == (
            "secondary",
            "text_color_dark",
        )
        assert fields["accent_low_foreground_color_light"] == (
            "accent",
            "subtext_color_light",
        )
        assert fields["neutral_accent_color_dark"] == ("neutral", "accent_color_dark")

    def test_passthrough_fields_are_not_migrated(self):
        assert not set(legacy_themes.LEGACY_PASSTHROUGH_FIELDS) & set(
            legacy_themes.LEGACY_MIGRATED_FIELDS
        )


class TestHasLegacyColors:
    def test_empty(self):
        assert legacy_themes.has_legacy_colors({}) is False

    def test_only_passthrough_fields(self):
        assert (
            legacy_themes.has_legacy_colors({"event_color_light": "#d32f2f"}) is False
        )

    def test_with_a_colour(self):
        assert legacy_themes.has_legacy_colors({"primary_color_light": "#fff"}) is True


class TestColorGroupsFromLegacy:
    def test_overlays_colours_onto_the_base(self):
        groups = legacy_themes.color_groups_from_legacy(
            {
                "primary_color_light": "#ffffff",
                "primary_accent_color_light": "#b55e1c",
                "secondary_color_dark": "#ffffff",
            },
            DEFAULT_COLOR_GROUPS,
        )
        assert groups["primary"]["accent_color_light"] == "#b55e1c"
        assert groups["secondary"]["background_color_dark"] == "#ffffff"
        # untouched keys keep the base value
        assert (
            groups["neutral"]["background_color_light"]
            == DEFAULT_COLOR_GROUPS["neutral"]["background_color_light"]
        )

    def test_primary_font_applies_to_every_base_group(self):
        groups = legacy_themes.color_groups_from_legacy(
            {"font_family_primary": "Roboto, sans-serif"}, DEFAULT_COLOR_GROUPS
        )
        assert {g["font_family"] for g in groups.values()} == {"Roboto, sans-serif"}

    def test_empty_values_are_ignored(self):
        groups = legacy_themes.color_groups_from_legacy(
            {"primary_color_light": None, "primary_color_dark": ""},
            DEFAULT_COLOR_GROUPS,
        )
        assert groups["primary"] == DEFAULT_COLOR_GROUPS["primary"]

    def test_base_is_not_mutated(self):
        base = {"primary": {"id": "primary", "background_color_light": "#000"}}
        legacy_themes.color_groups_from_legacy({"primary_color_light": "#fff"}, base)
        assert base["primary"]["background_color_light"] == "#000"

"""Read theme definitions written before Color Groups existed.

Up to 1.0.0a14 a theme stored each colour in its own registry record, named
``<group>_<role>_<mode>`` (``primary_foreground_color_light`` and so on), plus
two font families and three content-type colours. Color Groups replaced the
per-colour records; this module maps the old names onto the new shape so that
a site keeps its colours whether or not the upgrade step has run yet.

Everything here is pure: it takes and returns plain dicts and never touches
the registry, so :mod:`sc.voltolighttheme.utils.themes` can use it without an
import cycle.
"""

#: The four color groups the old theme definition had fields for.
LEGACY_GROUPS = ("primary", "secondary", "accent", "neutral")

#: Old field role suffix -> Color Group key prefix.
_ROLES = {
    "color": "background_color",
    "foreground_color": "text_color",
    "low_foreground_color": "subtext_color",
    "accent_color": "accent_color",
}

#: Old colour field name -> (color group id, Color Group key).
LEGACY_COLOR_FIELDS: dict[str, tuple[str, str]] = {
    f"{group}_{role}_{mode}": (group, f"{key}_{mode}")
    for group in LEGACY_GROUPS
    for role, key in _ROLES.items()
    for mode in ("light", "dark")
}

#: The old site-wide font, now the ``font_family`` of every base group.
LEGACY_FONT_FIELD = "font_family_primary"

#: Fields folded into ``color_groups`` by the migration.
LEGACY_MIGRATED_FIELDS = (*LEGACY_COLOR_FIELDS, LEGACY_FONT_FIELD)

#: Old fields with no place in the Color Group model. The frontend still reads
#: them as CSS custom properties (``--font-family-secondary`` for headings,
#: ``--event-color-light`` and so on for content-type chips), so their records
#: are kept and served as theme settings.
LEGACY_PASSTHROUGH_FIELDS = (
    "font_family_secondary",
    "event_color_light",
    "event_color_dark",
    "file_color_light",
    "file_color_dark",
    "image_color_light",
    "image_color_dark",
)

#: Every field name the old theme definition had, besides name/description.
LEGACY_FIELDS = (*LEGACY_MIGRATED_FIELDS, *LEGACY_PASSTHROUGH_FIELDS)


def has_legacy_colors(values: dict) -> bool:
    """Whether ``values`` carries any field the migration folds into groups."""
    return any(values.get(name) for name in LEGACY_MIGRATED_FIELDS)


def color_groups_from_legacy(values: dict, base: dict) -> dict:
    """Overlay old per-colour fields onto a Color Group mapping.

    :param values: old field name -> value; unknown and empty keys are ignored.
    :param base: the Color Groups to start from (left unchanged).
    :returns: a new mapping, with the base groups updated from ``values``.
    """
    groups = {gid: dict(data) for gid, data in base.items()}
    for name, (gid, key) in LEGACY_COLOR_FIELDS.items():
        value = values.get(name)
        if value and gid in groups:
            groups[gid][key] = value
    font = values.get(LEGACY_FONT_FIELD)
    if font:
        for gid in LEGACY_GROUPS:
            if gid in groups:
                groups[gid]["font_family"] = font
    return groups

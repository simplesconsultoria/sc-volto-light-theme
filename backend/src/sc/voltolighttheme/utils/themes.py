"""Enumerate and read theme definitions stored in ``plone.registry``.

Themes have no index of their own: like ``plone.app.querystring`` operations,
they are discovered by walking the registry records and filtering on a prefix
(compare ``plone.app.querystring.registryreader.QuerystringRegistryReader``).

Every theme occupies records named
``sc.voltolighttheme.theme.<theme-id>.<field-name>``.
"""

from plone.registry import Record
from plone.registry.field import TextLine
from plone.registry.interfaces import IRegistry
from sc.voltolighttheme import logger
from sc.voltolighttheme.interfaces import ISCVLTThemeSchema
from sc.voltolighttheme.utils.legacy_themes import color_groups_from_legacy
from sc.voltolighttheme.utils.legacy_themes import has_legacy_colors
from sc.voltolighttheme.utils.legacy_themes import LEGACY_COLOR_FIELDS
from sc.voltolighttheme.utils.legacy_themes import LEGACY_FIELDS
from sc.voltolighttheme.utils.legacy_themes import LEGACY_FONT_FIELD
from sc.voltolighttheme.utils.legacy_themes import LEGACY_MIGRATED_FIELDS
from sc.voltolighttheme.utils.legacy_themes import LEGACY_PASSTHROUGH_FIELDS
from zope.component import getUtility
from zope.schema import getFieldNames

import re


PREFIX = "sc.voltolighttheme.theme"

#: Id of the theme shipped with the add-on. It may never be deleted.
DEFAULT_THEME_ID = "default"

#: Theme ids become part of a dotted registry key, so a dot would split the
#: record name and corrupt enumeration. Keep them to a conservative slug.
THEME_ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]*$")

#: Color group ids end up in custom Block Theme names on the frontend
#: (``custom-<back>-<front>``), which are split on ``-``. A dash inside a group
#: id would make that name ambiguous, so group ids use underscores instead.
COLOR_GROUP_ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9_]*$")

#: Fields that describe the theme rather than style it. They belong in a
#: theme record and in the control panel, but not in the payload the frontend
#: applies as CSS custom properties — the serialized field already carries the
#: name as its ``title``. Everything *not* listed here is a theme setting, so a
#: new style field is picked up without touching this module.
THEME_METADATA_FIELDS = ("name", "description")

#: Base color groups that cannot be deleted.
BASE_COLOR_GROUPS = frozenset({"primary", "secondary", "accent", "neutral"})

#: Base block themes that cannot be deleted.
BASE_BLOCK_THEMES = frozenset({"default", "alternative"})

DEFAULT_COLOR_GROUPS = {
    "primary": {
        "id": "primary",
        "name": "Primary",
        "font_family": "Inter, sans-serif",
        "background_color_light": "#ffffff",
        "background_color_dark": "#14171c",
        "text_color_light": "#1d2129",
        "text_color_dark": "#f1f3f5",
        "subtext_color_light": "#4a5260",
        "subtext_color_dark": "#b4bcc8",
        "accent_color_light": "#1971c2",
        "accent_color_dark": "#74c0fc",
        "bg_image_light_desktop": "",
        "bg_image_light_mobile": "",
        "bg_image_dark_desktop": "",
        "bg_image_dark_mobile": "",
        "bg_size": "auto",
        "bg_repeat": "repeat",
        "bg_position": "center",
    },
    "secondary": {
        "id": "secondary",
        "name": "Secondary",
        "font_family": "Inter, sans-serif",
        # Dark gray: the strong band (footer, header bar, ``grey`` blocks).
        "background_color_light": "#343a40",
        "background_color_dark": "#343a40",
        "text_color_light": "#f8f9fa",
        "text_color_dark": "#f1f3f5",
        "subtext_color_light": "#ced4da",
        "subtext_color_dark": "#c3cad4",
        "accent_color_light": "#a5d8ff",
        "accent_color_dark": "#74c0fc",
        "bg_image_light_desktop": "",
        "bg_image_light_mobile": "",
        "bg_image_dark_desktop": "",
        "bg_image_dark_mobile": "",
        "bg_size": "auto",
        "bg_repeat": "repeat",
        "bg_position": "center",
    },
    "accent": {
        "id": "accent",
        "name": "Accent",
        "font_family": "Inter, sans-serif",
        # Dark blue, with light text.
        "background_color_light": "#0f4c81",
        "background_color_dark": "#1b4d82",
        "text_color_light": "#ffffff",
        "text_color_dark": "#e7f5ff",
        "subtext_color_light": "#d0ebff",
        "subtext_color_dark": "#b8d7ef",
        "accent_color_light": "#a5d8ff",
        "accent_color_dark": "#a5d8ff",
        "bg_image_light_desktop": "",
        "bg_image_light_mobile": "",
        "bg_image_dark_desktop": "",
        "bg_image_dark_mobile": "",
        "bg_size": "auto",
        "bg_repeat": "repeat",
        "bg_position": "center",
    },
    "neutral": {
        "id": "neutral",
        "name": "Neutral",
        "font_family": "Inter, sans-serif",
        "background_color_light": "#f6f7f9",
        "background_color_dark": "#242932",
        "text_color_light": "#1d2129",
        "text_color_dark": "#f1f3f5",
        "subtext_color_light": "#4a5260",
        "subtext_color_dark": "#c3cad4",
        "accent_color_light": "#1971c2",
        "accent_color_dark": "#74c0fc",
        "bg_image_light_desktop": "",
        "bg_image_light_mobile": "",
        "bg_image_dark_desktop": "",
        "bg_image_dark_mobile": "",
        "bg_size": "auto",
        "bg_repeat": "repeat",
        "bg_position": "center",
    },
}

DEFAULT_BLOCK_THEMES = {
    "default": {
        "id": "default",
        "name": "Primary",
        "back_color_group": "primary",
        "front_color_group": "neutral",
    },
    "alternative": {
        "id": "alternative",
        "name": "Alternative",
        "back_color_group": "accent",
        "front_color_group": "primary",
    },
}

#: Values given to a color group created without them, or copied into a theme
#: that lacks a group defined elsewhere. Mirrors the default "primary" group.
FALLBACK_COLOR_GROUP = {
    key: value
    for key, value in DEFAULT_COLOR_GROUPS["primary"].items()
    if key not in ("id", "name")
}

NATAL_COLOR_GROUPS = {
    "primary": {
        "id": "primary",
        "name": "Primary",
        "font_family": "Inter, sans-serif",
        "background_color_light": "#ffffff",
        "background_color_dark": "#0d2317",
        "text_color_light": "#143d24",
        "text_color_dark": "#f0f7f2",
        "subtext_color_light": "#436650",
        "subtext_color_dark": "#a3c4b0",
        "accent_color_light": "#c41e3a",
        "accent_color_dark": "#ea4335",
        "bg_image_light_desktop": "",
        "bg_image_light_mobile": "",
        "bg_image_dark_desktop": "",
        "bg_image_dark_mobile": "",
        "bg_size": "auto",
        "bg_repeat": "repeat",
        "bg_position": "center",
    },
    "secondary": {
        "id": "secondary",
        "name": "Secondary",
        "font_family": "Inter, sans-serif",
        "background_color_light": "#165b33",
        "background_color_dark": "#071a10",
        "text_color_light": "#ffffff",
        "text_color_dark": "#ffffff",
        "subtext_color_light": "#d1e7dd",
        "subtext_color_dark": "#c0d6c8",
        "accent_color_light": "#f8b229",
        "accent_color_dark": "#f8b229",
        "bg_image_light_desktop": "",
        "bg_image_light_mobile": "",
        "bg_image_dark_desktop": "",
        "bg_image_dark_mobile": "",
        "bg_size": "auto",
        "bg_repeat": "repeat",
        "bg_position": "center",
    },
    "accent": {
        "id": "accent",
        "name": "Accent",
        "font_family": "Inter, sans-serif",
        "background_color_light": "#c41e3a",
        "background_color_dark": "#7d1222",
        "text_color_light": "#ffffff",
        "text_color_dark": "#ffffff",
        "subtext_color_light": "#ffe5e8",
        "subtext_color_dark": "#ffd0d5",
        "accent_color_light": "#f8b229",
        "accent_color_dark": "#f8b229",
        "bg_image_light_desktop": "",
        "bg_image_light_mobile": "",
        "bg_image_dark_desktop": "",
        "bg_image_dark_mobile": "",
        "bg_size": "auto",
        "bg_repeat": "repeat",
        "bg_position": "center",
    },
    "neutral": {
        "id": "neutral",
        "name": "Neutral",
        "font_family": "Inter, sans-serif",
        "background_color_light": "#f2f7f4",
        "background_color_dark": "#1b3024",
        "text_color_light": "#143d24",
        "text_color_dark": "#ffffff",
        "subtext_color_light": "#52735f",
        "subtext_color_dark": "#b5d0c0",
        "accent_color_light": "#c41e3a",
        "accent_color_dark": "#f8b229",
        "bg_image_light_desktop": "",
        "bg_image_light_mobile": "",
        "bg_image_dark_desktop": "",
        "bg_image_dark_mobile": "",
        "bg_size": "auto",
        "bg_repeat": "repeat",
        "bg_position": "center",
    },
}

NATAL_BLOCK_THEMES = {
    "default": {
        "id": "default",
        "name": "Primary",
        "back_color_group": "primary",
        "front_color_group": "neutral",
    },
    "alternative": {
        "id": "alternative",
        "name": "Alternative",
        "back_color_group": "accent",
        "front_color_group": "primary",
    },
}


def is_valid_theme_id(theme_id: str) -> bool:
    """Check a theme id is usable as part of a registry record name.

    :param theme_id: the candidate id.
    :returns: whether the id is acceptable.
    """
    return bool(
        isinstance(theme_id, str) and theme_id and THEME_ID_PATTERN.match(theme_id)
    )


def is_valid_color_group_id(group_id: str) -> bool:
    """Check a color group id is usable in a custom Block Theme name.

    :param group_id: the candidate id.
    :returns: whether the id is acceptable.
    """
    return bool(
        isinstance(group_id, str)
        and group_id
        and COLOR_GROUP_ID_PATTERN.match(group_id)
    )


def theme_field_names() -> list[str]:
    """Names of the fields making up a theme definition.

    :returns: field names, as declared on :class:`ISCVLTThemeSchema`.
    """
    return list(getFieldNames(ISCVLTThemeSchema))


def _registry(registry=None):
    """Return the given registry, or look the local one up."""
    return getUtility(IRegistry) if registry is None else registry


def record_name(theme_id: str, field_name: str) -> str:
    """Build the registry record name for one field of one theme.

    :param theme_id: the theme id.
    :param field_name: the field name.
    :returns: the dotted record name.
    """
    return f"{PREFIX}.{theme_id}.{field_name}"


def theme_ids(registry=None) -> list[str]:
    """List the ids of every theme in the registry.

    :param registry: registry to read, defaulting to the local one.
    :returns: sorted theme ids.
    """
    registry = _registry(registry)
    prefix = f"{PREFIX}."
    found = set()
    for record in registry.records:
        if not record.startswith(prefix):
            continue
        remainder = record[len(prefix) :]
        # `<theme-id>.<field-name>` — anything without a field part is not a
        # theme record and must not invent an id.
        if "." not in remainder:
            continue
        found.add(remainder.split(".", 1)[0])
    return sorted(found)


def theme_exists(theme_id: str, registry=None) -> bool:
    """Check whether a theme is defined in the registry.

    :param theme_id: the theme id.
    :param registry: registry to read, defaulting to the local one.
    :returns: whether any record exists for that theme.
    """
    registry = _registry(registry)
    return any(
        record_name(theme_id, name) in registry.records for name in theme_field_names()
    )


def ensure_theme_records(theme_id: str, registry=None) -> None:
    """Ensure all records for a theme definition are registered in the registry."""
    registry = _registry(registry)
    prefix = record_name(theme_id, "").rstrip(".")
    try:
        registry.registerInterface(ISCVLTThemeSchema, prefix=prefix)
    except Exception:
        logger.exception("Could not register records for theme %r", theme_id)


def default_color_groups_for_theme(theme_id: str, registry=None) -> dict:
    """Return default color groups for a theme."""
    if theme_id == "natal":
        return {gid: dict(gdata) for gid, gdata in NATAL_COLOR_GROUPS.items()}
    return {gid: dict(gdata) for gid, gdata in DEFAULT_COLOR_GROUPS.items()}


def _stored_collection(theme_id: str, field: str, defaults: dict, registry) -> dict:
    """Read a stored color group / block theme mapping, completed with defaults.

    :returns: entries by id, each carrying its ``id``; empty when nothing is
        stored, so the caller can decide on a fallback.
    """
    rec = record_name(theme_id, field)
    stored = registry[rec] if rec in registry.records else None
    if not stored:
        return {}
    result = {}
    for key, data in _as_mapping(stored).items():
        if isinstance(data, dict):
            result[key] = {"id": key, **data}
    for base_id, base_data in defaults.items():
        result.setdefault(base_id, dict(base_data))
    return result


def legacy_theme_values(theme_id: str, registry=None) -> dict:
    """Read the pre-Color-Group fields still stored for a theme.

    :returns: old field name -> value, only for records that exist.
    """
    registry = _registry(registry)
    values = {}
    for name in LEGACY_FIELDS:
        rec = record_name(theme_id, name)
        if rec in registry.records:
            values[name] = registry[rec]
    return values


def get_theme_color_groups(theme_id: str, registry=None) -> dict:
    """Get the mapping of ColorGroups for one theme.

    Old per-colour records still present for the theme are laid over the
    stored groups. That covers two cases:

    - a site saved before Color Groups existed, read after the code update but
      before the upgrade step runs;
    - a project profile written for 1.0.0a14 and earlier that sets its palette
      on ``default``. sc.voltolighttheme's own profile, a dependency, has
      already stored ``color_groups`` for that theme, so ignoring the old
      records would silently replace the project's palette with ours.

    The old records are dropped the next time the groups are saved, so an
    edit in the control panel is never masked by them.

    :param theme_id: the theme id.
    :param registry: registry to read, defaulting to the local one.
    :returns: color groups by id.
    """
    registry = _registry(registry)
    defaults = NATAL_COLOR_GROUPS if theme_id == "natal" else DEFAULT_COLOR_GROUPS
    stored = _stored_collection(theme_id, "color_groups", defaults, registry)
    base = stored or default_color_groups_for_theme(theme_id, registry)
    legacy = legacy_theme_values(theme_id, registry)
    if has_legacy_colors(legacy):
        return color_groups_from_legacy(legacy, base)
    return base


def get_theme_block_themes(theme_id: str, registry=None) -> dict:
    """Get the mapping of BlockThemes for one theme."""
    registry = _registry(registry)
    defaults = NATAL_BLOCK_THEMES if theme_id == "natal" else DEFAULT_BLOCK_THEMES
    stored = _stored_collection(theme_id, "block_themes", defaults, registry)
    return stored or {key: dict(data) for key, data in defaults.items()}


def migrate_legacy_theme(theme_id: str, registry=None) -> bool:
    """Fold a theme's old per-colour records into its ``color_groups`` record.

    Records listed in ``LEGACY_PASSTHROUGH_FIELDS`` are kept, since nothing
    else stores them. Running it again on a migrated theme does nothing.

    :returns: whether anything was migrated.
    """
    registry = _registry(registry)
    legacy = legacy_theme_values(theme_id, registry)
    if not has_legacy_colors(legacy):
        return False
    ensure_theme_records(theme_id, registry)
    if record_name(theme_id, "color_groups") not in registry.records:
        # Nowhere to fold the colours into: keep the old records.
        logger.warning("Theme %r not migrated: no color_groups record", theme_id)
        return False
    # Saving drops the old per-colour records, see save_theme_color_groups.
    save_theme_color_groups(
        theme_id, get_theme_color_groups(theme_id, registry), registry
    )
    return True


def _with_legacy_fields(theme_id: str, values: dict, registry) -> dict:
    """Accept the old per-colour fields in a theme update.

    Clients written for 1.0.0a14 and earlier keep working: their colours are
    folded into ``color_groups`` (unless groups are sent too), and the fields
    with no Color Group equivalent are stored as they are.

    :returns: ``values``, with ``color_groups`` added when derived.
    """
    _write_passthrough(theme_id, values, registry)
    legacy_keys = set(LEGACY_COLOR_FIELDS) | {LEGACY_FONT_FIELD}
    if "color_groups" in values or not legacy_keys.intersection(values):
        return values
    current = get_theme_color_groups(theme_id, registry)
    return {**values, "color_groups": color_groups_from_legacy(values, current)}


def _write_passthrough(theme_id: str, values: dict, registry) -> None:
    """Store the old fields that have no Color Group equivalent."""
    for name in LEGACY_PASSTHROUGH_FIELDS:
        if name not in values:
            continue
        rec = record_name(theme_id, name)
        if rec not in registry.records:
            registry.records[rec] = Record(TextLine(required=False))
        registry[rec] = values[name] or None


def save_theme_color_groups(theme_id: str, color_groups: dict, registry=None) -> None:
    """Save ColorGroups mapping for one theme in the registry.

    The theme's old per-colour records, if any, are removed once the groups
    are stored: callers pass groups read through
    :func:`get_theme_color_groups`, which already carry their values.

    :param theme_id: the theme id.
    :param color_groups: color groups by id.
    :param registry: registry to write, defaulting to the local one.
    """
    registry = _registry(registry)
    rec = record_name(theme_id, "color_groups")
    if rec not in registry.records:
        ensure_theme_records(theme_id, registry)
    normalized = {}
    for gid, gdata in color_groups.items():
        if isinstance(gdata, dict):
            grp = dict(gdata)
            grp.setdefault("id", gid)
            normalized[gid] = grp
    if rec not in registry.records:
        return
    registry[rec] = normalized
    for name in LEGACY_MIGRATED_FIELDS:
        legacy_rec = record_name(theme_id, name)
        if legacy_rec in registry.records:
            del registry.records[legacy_rec]


def save_theme_block_themes(theme_id: str, block_themes: dict, registry=None) -> None:
    """Save BlockThemes mapping for one theme in the registry."""
    registry = _registry(registry)
    rec = record_name(theme_id, "block_themes")
    if rec not in registry.records:
        ensure_theme_records(theme_id, registry)
    normalized = {}
    for btid, btdata in block_themes.items():
        if isinstance(btdata, dict):
            bt = dict(btdata)
            bt.setdefault("id", btid)
            normalized[btid] = bt
    if rec in registry.records:
        registry[rec] = normalized


def sync_color_groups_across_themes(registry=None) -> None:
    """Ensure every theme has all color groups defined across all themes.

    When a new color group is created on any theme (e.g. 'vermelho' on 'natal'),
    all other site themes (e.g. 'default') receive that color group initialized
    with default fallback values.
    """

    def missing_group(gid: str, template: dict) -> dict:
        return {
            "id": gid,
            "name": template.get("name", gid.capitalize()),
            **FALLBACK_COLOR_GROUP,
            "font_family": template.get(
                "font_family", FALLBACK_COLOR_GROUP["font_family"]
            ),
        }

    _sync_across_themes(
        DEFAULT_COLOR_GROUPS,
        get_theme_color_groups,
        save_theme_color_groups,
        missing_group,
        registry,
    )


def sync_block_themes_across_themes(registry=None) -> None:
    """Ensure every theme has all block themes defined across all themes."""
    _sync_across_themes(
        DEFAULT_BLOCK_THEMES,
        get_theme_block_themes,
        save_theme_block_themes,
        lambda _btid, template: dict(template),
        registry,
    )


def _sync_across_themes(defaults, read, save, make_missing, registry=None) -> None:
    """Copy every definition found on any theme into the themes that lack it.

    :param defaults: definitions every theme must have.
    :param read: ``read(theme_id, registry)`` returns a theme's definitions.
    :param save: ``save(theme_id, definitions, registry)`` stores them.
    :param make_missing: ``make_missing(id, template)`` builds the copy.
    """
    registry = _registry(registry)
    all_tids = theme_ids(registry)
    for tid in all_tids:
        ensure_theme_records(tid, registry)

    discovered = {key: dict(data) for key, data in defaults.items()}
    for tid in all_tids:
        for key, data in read(tid, registry).items():
            discovered.setdefault(key, dict(data))

    for tid in all_tids:
        current = dict(read(tid, registry))
        missing = {
            key: make_missing(key, template)
            for key, template in discovered.items()
            if key not in current
        }
        if missing:
            save(tid, {**current, **missing}, registry)


def create_color_group(theme_id: str, group_data: dict, registry=None) -> dict:
    """Create a new color group in theme_id and sync across all site themes.

    :param theme_id: the theme id where this color group is created.
    :param group_data: the ColorGroup definition.
    :returns: the normalized ColorGroup dict.
    :raises ValueError: if id is invalid or empty.
    """
    registry = _registry(registry)
    gid = group_data.get("id")
    if not is_valid_color_group_id(gid):
        raise ValueError(f"Invalid color group id: {gid!r}")

    groups = dict(get_theme_color_groups(theme_id, registry))
    normalized = {
        "id": gid,
        "name": group_data.get("name", gid.capitalize()),
        **{
            key: group_data.get(key, default)
            for key, default in FALLBACK_COLOR_GROUP.items()
        },
    }
    groups[gid] = normalized
    save_theme_color_groups(theme_id, groups, registry)
    sync_color_groups_across_themes(registry)
    return normalized


def create_block_theme(theme_id: str, block_theme_data: dict, registry=None) -> dict:
    """Create a new block theme in theme_id and sync across all site themes.

    :param theme_id: the theme id where this block theme is created.
    :param block_theme_data: the BlockTheme definition.
    :returns: the normalized BlockTheme dict.
    """
    registry = _registry(registry)
    btid = block_theme_data.get("id")
    if not btid or not is_valid_theme_id(btid):
        raise ValueError(f"Invalid block theme id: {btid!r}")

    bts = dict(get_theme_block_themes(theme_id, registry))
    normalized = {
        "id": btid,
        "name": block_theme_data.get("name", btid.capitalize()),
        "back_color_group": block_theme_data.get("back_color_group", "primary"),
        "front_color_group": block_theme_data.get("front_color_group", "neutral"),
    }
    bts[btid] = normalized
    save_theme_block_themes(theme_id, bts, registry)
    sync_block_themes_across_themes(registry)
    return normalized


def delete_color_group(theme_id: str, group_id: str, registry=None) -> None:
    """Delete a custom color group across all themes and revert references to 'primary'.

    :param theme_id: the theme id where the deletion was initiated.
    :param group_id: the color group id to delete.
    :param registry: registry to write, defaulting to the local one.
    :raises ValueError: if group_id is in BASE_COLOR_GROUPS.
    """
    if group_id in BASE_COLOR_GROUPS:
        raise ValueError(f"Base color group {group_id!r} cannot be deleted.")

    registry = _registry(registry)
    all_tids = theme_ids(registry)
    for tid in all_tids:
        # 1. Remove from color_groups
        groups = dict(get_theme_color_groups(tid, registry))
        if group_id in groups:
            del groups[group_id]
            save_theme_color_groups(tid, groups, registry)

        # 2. Revert any block theme references to 'primary'
        bts = dict(get_theme_block_themes(tid, registry))
        bt_changed = False
        for bt in bts.values():
            if bt.get("back_color_group") == group_id:
                bt["back_color_group"] = "primary"
                bt_changed = True
            if bt.get("front_color_group") == group_id:
                bt["front_color_group"] = "primary"
                bt_changed = True
        if bt_changed:
            save_theme_block_themes(tid, bts, registry)


def delete_block_theme(theme_id: str, btid: str, registry=None) -> None:
    """Delete a custom block theme across all themes.

    :param theme_id: the theme id where the deletion was initiated.
    :param btid: the block theme id to delete.
    :param registry: registry to write, defaulting to the local one.
    :raises ValueError: if btid is in BASE_BLOCK_THEMES.
    """
    if btid in BASE_BLOCK_THEMES:
        raise ValueError(f"Base block theme {btid!r} cannot be deleted.")

    registry = _registry(registry)
    all_tids = theme_ids(registry)
    for tid in all_tids:
        bts = dict(get_theme_block_themes(tid, registry))
        if btid in bts:
            del bts[btid]
            save_theme_block_themes(tid, bts, registry)


def theme_values(theme_id: str, registry=None) -> dict:
    """Read every stored field of one theme.

    Fields with no record are omitted rather than reported as ``None``, so a
    caller can tell "not set" from "not part of this theme".

    :param theme_id: the theme id.
    :param registry: registry to read, defaulting to the local one.
    :returns: field name to value; empty when the theme does not exist.
    """
    registry = _registry(registry)
    if not theme_exists(theme_id, registry):
        return {}

    ensure_theme_records(theme_id, registry)

    values = {}
    for name in theme_field_names():
        record = record_name(theme_id, name)
        if record in registry.records:
            values[name] = registry[record]

    if not values:
        return {}

    # Old fields with no Color Group equivalent keep reaching the frontend.
    for name in LEGACY_PASSTHROUGH_FIELDS:
        record = record_name(theme_id, name)
        if record in registry.records and registry[record]:
            values[name] = registry[record]

    # Always read through the helpers: they complete the base entries and lay
    # old per-colour records over the stored groups.
    values["color_groups"] = get_theme_color_groups(theme_id, registry)
    values["block_themes"] = get_theme_block_themes(theme_id, registry)

    return values


def theme_settings(theme_id: str, registry=None) -> dict:
    """Read the style-bearing settings of one theme.

    These are the fields the frontend turns into CSS custom properties. They
    are colours today, but the name is deliberately broader: any style variable
    added to :class:`ISCVLTThemeSchema` becomes a setting automatically,
    since only :data:`THEME_METADATA_FIELDS` is excluded.

    Use :func:`theme_values` for the control panel, which edits the whole
    record, metadata included.

    :param theme_id: the theme id.
    :param registry: registry to read, defaulting to the local one.
    :returns: field name to value, without the metadata fields.
    """
    values = theme_values(theme_id, registry)
    if not values:
        return {}

    return {
        name: value
        for name, value in values.items()
        if name not in THEME_METADATA_FIELDS
    }


def theme_title(theme_id: str, registry=None) -> str:
    """Human-readable title of a theme, falling back to its id.

    :param theme_id: the theme id.
    :param registry: registry to read, defaulting to the local one.
    :returns: the theme ``name``, or the id when unset.
    """
    registry = _registry(registry)
    record = record_name(theme_id, "name")
    if record in registry.records:
        return registry[record] or theme_id
    return theme_id


def all_themes(registry=None) -> list[dict]:
    """Read every theme, each as a dict carrying its id.

    :param registry: registry to read, defaulting to the local one.
    :returns: one entry per theme, sorted by id.
    """
    registry = _registry(registry)
    return [
        {"id": theme_id, **theme_values(theme_id, registry)}
        for theme_id in theme_ids(registry)
    ]


def create_theme(theme_id: str, values: dict | None = None, registry=None) -> dict:
    """Register the records for a new theme.

    :param theme_id: the theme id.
    :param values: initial field values.
    :param registry: registry to write, defaulting to the local one.
    :returns: the stored theme values.
    :raises ValueError: if the id is malformed or already taken.
    """
    registry = _registry(registry)
    if not is_valid_theme_id(theme_id):
        raise ValueError(f"Invalid theme id: {theme_id!r}")
    if theme_exists(theme_id, registry):
        raise ValueError(f"Theme already exists: {theme_id!r}")

    registry.registerInterface(
        ISCVLTThemeSchema, prefix=record_name(theme_id, "").rstrip(".")
    )
    if values:
        update_theme(theme_id, values, registry)
    else:
        sync_color_groups_across_themes(registry)
        sync_block_themes_across_themes(registry)
    return theme_values(theme_id, registry)


def _as_mapping(value) -> dict:
    """Normalize a list of ``{"id": ...}`` items, or a dict, to a dict by id.

    Stored values are read leniently: anything else becomes an empty mapping.
    Use :func:`_validated_collection` for values coming from a request.
    """
    if isinstance(value, list):
        return {
            item["id"]: item
            for item in value
            if isinstance(item, dict) and "id" in item
        }
    if isinstance(value, dict):
        return dict(value)
    return {}


def _validated_collection(name: str, value, is_valid_id, bases=frozenset()) -> dict:
    """Check a color group / block theme collection sent by a client.

    The collection is a merge patch (see :func:`_merge_collection`): an entry
    is an object, or ``None`` to delete it. Everything is checked here, before
    anything is written, so a rejected update leaves no trace.

    :param name: the field name, for the error message.
    :param value: a mapping by id, or a list of objects carrying an ``id``.
    :param is_valid_id: predicate for the entry ids.
    :param bases: ids that may not be deleted.
    :returns: the collection as a mapping by id.
    :raises ValueError: when the value or one of its entries is malformed, or
        when it deletes a base entry.
    """
    if isinstance(value, list):
        if not all(isinstance(item, dict) and "id" in item for item in value):
            raise ValueError(f"{name}: every item must be an object with an id")
        value = {item["id"]: item for item in value}
    if not isinstance(value, dict):
        raise ValueError(f"{name} must be an object keyed by id")
    for key, data in value.items():
        if not is_valid_id(key):
            raise ValueError(f"{name}: invalid id {key!r}")
        if data is None:
            if key in bases:
                raise ValueError(f"{name}: base entry {key!r} cannot be deleted")
            continue
        if not isinstance(data, dict):
            raise ValueError(f"{name}.{key} must be an object or null")
        if data.get("id", key) != key:
            raise ValueError(f"{name}: invalid id {key!r}")
    return dict(value)


def _merge_collection(theme_id, value, bases, defaults, read, delete, registry):
    """Merge a color group / block theme collection into the stored one.

    The update is a JSON Merge Patch (RFC 7396) keyed by id:

    - an entry left out is kept as it is;
    - an entry sent is merged field by field onto the stored one, so a client
      may send only the fields it changes;
    - an entry sent as ``None`` is deleted, cascading across all themes the
      way ``delete`` does.

    Base entries are restored if missing.

    :returns: the collection to store for ``theme_id``.
    """
    value = _as_mapping(value)
    # Delete first, so the merge below starts from what the cascade left.
    for key, data in value.items():
        if data is None:
            delete(theme_id, key, registry)
    merged = {key: dict(data) for key, data in read(theme_id, registry).items()}
    for key, data in value.items():
        if data is None:
            merged.pop(key, None)
        else:
            merged[key] = {**merged.get(key, {}), **data, "id": key}
    for base_id in bases:
        if base_id not in merged and base_id in defaults:
            merged[base_id] = dict(defaults[base_id])
    return merged


def _validated_values(values: dict) -> dict:
    """Validate the collections in a theme update.

    :param values: field values sent by a client.
    :returns: a copy, with the collections normalized to mappings by id.
    :raises ValueError: if a collection is malformed or deletes a base entry.
    """
    values = dict(values)
    checks = {
        "color_groups": (is_valid_color_group_id, BASE_COLOR_GROUPS),
        "block_themes": (is_valid_theme_id, BASE_BLOCK_THEMES),
    }
    for name, (is_valid_id, bases) in checks.items():
        if name in values:
            values[name] = _validated_collection(name, values[name], is_valid_id, bases)
    return values


def update_theme(theme_id: str, values: dict, registry=None) -> dict:
    """Write field values onto an existing theme.

    Only the keys present in ``values`` are written, so this is a partial
    update. Unknown keys are ignored rather than raising, since they may come
    straight from a request body.

    ``color_groups`` and ``block_themes`` are merged by id rather than
    replaced: entries left out are kept, entries sent are merged onto the
    stored ones, and an entry sent as ``None`` is deleted on every theme (see
    :func:`_merge_collection`).

    :param theme_id: the theme id.
    :param values: field values to write.
    :param registry: registry to write, defaulting to the local one.
    :returns: the stored theme values.
    :raises KeyError: if the theme does not exist.
    :raises ValueError: if ``color_groups`` or ``block_themes`` is malformed,
        or deletes a base entry.
    """
    registry = _registry(registry)
    if not theme_exists(theme_id, registry):
        raise KeyError(theme_id)

    # Validate before writing anything: a rejected update leaves no trace.
    values = _validated_values(values)

    ensure_theme_records(theme_id, registry)

    values = _with_legacy_fields(theme_id, values, registry)

    collections = {
        "color_groups": (
            BASE_COLOR_GROUPS,
            DEFAULT_COLOR_GROUPS,
            get_theme_color_groups,
            delete_color_group,
            save_theme_color_groups,
        ),
        "block_themes": (
            BASE_BLOCK_THEMES,
            DEFAULT_BLOCK_THEMES,
            get_theme_block_themes,
            delete_block_theme,
            save_theme_block_themes,
        ),
    }
    known = set(theme_field_names())
    for name, value in values.items():
        if name not in known:
            continue
        if name in collections:
            bases, defaults, read, delete, save = collections[name]
            value = _merge_collection(
                theme_id, value, bases, defaults, read, delete, registry
            )
            # Through the helper: saving color groups also drops the theme's
            # old per-colour records, which would otherwise mask the update.
            save(theme_id, value, registry)
            continue
        rec = record_name(theme_id, name)
        if rec not in registry.records:
            ensure_theme_records(theme_id, registry)
        if rec in registry.records:
            registry[rec] = value

    if "color_groups" in values:
        sync_color_groups_across_themes(registry)
    if "block_themes" in values:
        sync_block_themes_across_themes(registry)

    return theme_values(theme_id, registry)


def delete_theme(theme_id: str, registry=None) -> None:
    """Remove every record belonging to a theme.

    :param theme_id: the theme id.
    :param registry: registry to write, defaulting to the local one.
    :raises KeyError: if the theme does not exist.
    :raises ValueError: if asked to delete the default theme.
    """
    registry = _registry(registry)
    if theme_id == DEFAULT_THEME_ID:
        raise ValueError("The default theme cannot be deleted.")
    if not theme_exists(theme_id, registry):
        raise KeyError(theme_id)

    # Every record under the theme's prefix, not only the current fields:
    # a leftover record from an older definition would otherwise make
    # :func:`theme_ids` list the deleted theme again.
    prefix = record_name(theme_id, "")
    for record in [name for name in registry.records if name.startswith(prefix)]:
        del registry.records[record]

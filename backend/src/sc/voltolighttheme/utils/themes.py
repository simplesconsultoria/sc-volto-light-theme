"""Enumerate and read theme definitions stored in ``plone.registry``.

Themes have no index of their own: like ``plone.app.querystring`` operations,
they are discovered by walking the registry records and filtering on a prefix
(compare ``plone.app.querystring.registryreader.QuerystringRegistryReader``).

Every theme occupies records named
``sc.voltolighttheme.theme.<theme-id>.<field-name>``.
"""

from plone.registry.interfaces import IRegistry
from sc.voltolighttheme.interfaces import ISCVLTThemeDefinition
from zope.component import getUtility
from zope.schema import getFieldNames

import re


PREFIX = "sc.voltolighttheme.theme"

#: Id of the theme shipped with the add-on. It may never be deleted.
DEFAULT_THEME_ID = "default"

#: Theme ids become part of a dotted registry key, so a dot would split the
#: record name and corrupt enumeration. Keep them to a conservative slug.
THEME_ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]*$")

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
        "background_color_dark": "#000000",
        "text_color_light": "#000000",
        "text_color_dark": "#ffffff",
        "subtext_color_light": "#333333",
        "subtext_color_dark": "#f8f8f8",
        "accent_color_light": "#b55e1c",
        "accent_color_dark": "#f4822c",
    },
    "secondary": {
        "id": "secondary",
        "name": "Secondary",
        "font_family": "Inter, sans-serif",
        "background_color_light": "#000000",
        "background_color_dark": "#ffffff",
        "text_color_light": "#ffffff",
        "text_color_dark": "#000000",
        "subtext_color_light": "#e6e6e6",
        "subtext_color_dark": "#333333",
        "accent_color_light": "#f4822c",
        "accent_color_dark": "#f4822c",
    },
    "accent": {
        "id": "accent",
        "name": "Accent",
        "font_family": "Inter, sans-serif",
        "background_color_light": "#f4822c",
        "background_color_dark": "#b55e1c",
        "text_color_light": "#000000",
        "text_color_dark": "#ffffff",
        "subtext_color_light": "#333333",
        "subtext_color_dark": "#f8f8f8",
        "accent_color_light": "#000000",
        "accent_color_dark": "#ffffff",
    },
    "neutral": {
        "id": "neutral",
        "name": "Neutral",
        "font_family": "Inter, sans-serif",
        "background_color_light": "#edeff0",
        "background_color_dark": "#333333",
        "text_color_light": "#000000",
        "text_color_dark": "#ffffff",
        "subtext_color_light": "#333333",
        "subtext_color_dark": "#e6e6e6",
        "accent_color_light": "#f4822c",
        "accent_color_dark": "#f4822c",
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
    return bool(theme_id and THEME_ID_PATTERN.match(theme_id))


def theme_field_names() -> list[str]:
    """Names of the fields making up a theme definition.

    :returns: field names, as declared on :class:`ISCVLTThemeDefinition`.
    """
    return list(getFieldNames(ISCVLTThemeDefinition))


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


def default_color_groups_for_theme(theme_id: str, registry=None) -> dict:
    """Return default color groups for a theme."""
    if theme_id == "natal":
        return {gid: dict(gdata) for gid, gdata in NATAL_COLOR_GROUPS.items()}
    return {gid: dict(gdata) for gid, gdata in DEFAULT_COLOR_GROUPS.items()}


def get_theme_color_groups(theme_id: str, registry=None) -> dict:
    """Get the mapping of ColorGroups for one theme."""
    registry = _registry(registry)
    rec = record_name(theme_id, "color_groups")
    if rec in registry.records and registry[rec]:
        stored = registry[rec]
        if isinstance(stored, list):
            result = {
                item["id"]: dict(item)
                for item in stored
                if isinstance(item, dict) and "id" in item
            }
        elif isinstance(stored, dict):
            # Ensure id property inside each dict
            result = {}
            for k, v in stored.items():
                if isinstance(v, dict):
                    grp = dict(v)
                    grp.setdefault("id", k)
                    result[k] = grp
        else:
            result = {}
        base_defaults = (
            NATAL_COLOR_GROUPS if theme_id == "natal" else DEFAULT_COLOR_GROUPS
        )
        for base_id, base_data in base_defaults.items():
            if base_id not in result:
                result[base_id] = dict(base_data)
        return result
    return default_color_groups_for_theme(theme_id, registry)


def get_theme_block_themes(theme_id: str, registry=None) -> dict:
    """Get the mapping of BlockThemes for one theme."""
    registry = _registry(registry)
    rec = record_name(theme_id, "block_themes")
    if rec in registry.records and registry[rec]:
        stored = registry[rec]
        if isinstance(stored, list):
            result = {
                item["id"]: dict(item)
                for item in stored
                if isinstance(item, dict) and "id" in item
            }
        elif isinstance(stored, dict):
            result = {}
            for k, v in stored.items():
                if isinstance(v, dict):
                    bt = dict(v)
                    bt.setdefault("id", k)
                    result[k] = bt
        else:
            result = {}
        base_defaults = (
            NATAL_BLOCK_THEMES if theme_id == "natal" else DEFAULT_BLOCK_THEMES
        )
        for base_id, base_data in base_defaults.items():
            if base_id not in result:
                result[base_id] = dict(base_data)
        return result
    if theme_id == "natal":
        return {k: dict(v) for k, v in NATAL_BLOCK_THEMES.items()}
    return {k: dict(v) for k, v in DEFAULT_BLOCK_THEMES.items()}


def save_theme_color_groups(theme_id: str, color_groups: dict, registry=None) -> None:
    """Save ColorGroups mapping for one theme in the registry."""
    registry = _registry(registry)
    rec = record_name(theme_id, "color_groups")
    normalized = {}
    for gid, gdata in color_groups.items():
        if isinstance(gdata, dict):
            grp = dict(gdata)
            grp.setdefault("id", gid)
            normalized[gid] = grp
    if rec in registry.records:
        registry[rec] = normalized


def save_theme_block_themes(theme_id: str, block_themes: dict, registry=None) -> None:
    """Save BlockThemes mapping for one theme in the registry."""
    registry = _registry(registry)
    rec = record_name(theme_id, "block_themes")
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
    registry = _registry(registry)
    all_tids = theme_ids(registry)
    if not all_tids:
        return

    # 1. Discover all unique color group definitions across all themes
    discovered: dict[str, dict] = {}
    for gid, gdata in DEFAULT_COLOR_GROUPS.items():
        discovered[gid] = dict(gdata)

    for tid in all_tids:
        theme_groups = get_theme_color_groups(tid, registry)
        for gid, gdata in theme_groups.items():
            if gid not in discovered:
                discovered[gid] = dict(gdata)

    # 2. For each theme, ensure every discovered group exists
    for tid in all_tids:
        theme_groups = dict(get_theme_color_groups(tid, registry))
        changed = False
        for gid, template in discovered.items():
            if gid not in theme_groups:
                fallback = {
                    "id": gid,
                    "name": template.get("name", gid.capitalize()),
                    "font_family": template.get("font_family", "Inter, sans-serif"),
                    "background_color_light": "#ffffff",
                    "background_color_dark": "#000000",
                    "text_color_light": "#000000",
                    "text_color_dark": "#ffffff",
                    "subtext_color_light": "#757575",
                    "subtext_color_dark": "#9e9e9e",
                    "accent_color_light": "#f4822c",
                    "accent_color_dark": "#f4822c",
                }
                theme_groups[gid] = fallback
                changed = True
        if changed:
            save_theme_color_groups(tid, theme_groups, registry)


def sync_block_themes_across_themes(registry=None) -> None:
    """Ensure every theme has all block themes defined across all themes."""
    registry = _registry(registry)
    all_tids = theme_ids(registry)
    if not all_tids:
        return

    discovered: dict[str, dict] = {}
    for btid, btdata in DEFAULT_BLOCK_THEMES.items():
        discovered[btid] = dict(btdata)

    for tid in all_tids:
        theme_bts = get_theme_block_themes(tid, registry)
        for btid, btdata in theme_bts.items():
            if btid not in discovered:
                discovered[btid] = dict(btdata)

    for tid in all_tids:
        theme_bts = dict(get_theme_block_themes(tid, registry))
        changed = False
        for btid, template in discovered.items():
            if btid not in theme_bts:
                theme_bts[btid] = dict(template)
                changed = True
        if changed:
            save_theme_block_themes(tid, theme_bts, registry)


def create_color_group(theme_id: str, group_data: dict, registry=None) -> dict:
    """Create a new color group in theme_id and sync across all site themes.

    :param theme_id: the theme id where this color group is created.
    :param group_data: the ColorGroup definition.
    :returns: the normalized ColorGroup dict.
    :raises ValueError: if id is invalid or empty.
    """
    registry = _registry(registry)
    gid = group_data.get("id")
    if not gid or not is_valid_theme_id(gid):
        raise ValueError(f"Invalid color group id: {gid!r}")

    groups = dict(get_theme_color_groups(theme_id, registry))
    normalized = {
        "id": gid,
        "name": group_data.get("name", gid.capitalize()),
        "font_family": group_data.get("font_family", "Inter, sans-serif"),
        "background_color_light": group_data.get("background_color_light", "#ffffff"),
        "background_color_dark": group_data.get("background_color_dark", "#000000"),
        "text_color_light": group_data.get("text_color_light", "#000000"),
        "text_color_dark": group_data.get("text_color_dark", "#ffffff"),
        "subtext_color_light": group_data.get("subtext_color_light", "#757575"),
        "subtext_color_dark": group_data.get("subtext_color_dark", "#9e9e9e"),
        "accent_color_light": group_data.get("accent_color_light", "#f4822c"),
        "accent_color_dark": group_data.get("accent_color_dark", "#f4822c"),
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
        for btid, bt in bts.items():
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

    values = {}
    for name in theme_field_names():
        record = record_name(theme_id, name)
        if record in registry.records:
            values[name] = registry[record]

    if not values:
        return {}

    # Ensure color_groups and block_themes are populated
    if "color_groups" not in values or not values["color_groups"]:
        values["color_groups"] = get_theme_color_groups(theme_id, registry)
    if "block_themes" not in values or not values["block_themes"]:
        values["block_themes"] = get_theme_block_themes(theme_id, registry)

    return values


def theme_settings(theme_id: str, registry=None) -> dict:
    """Read the style-bearing settings of one theme.

    These are the fields the frontend turns into CSS custom properties. They
    are colours today, but the name is deliberately broader: any style variable
    added to :class:`ISCVLTThemeDefinition` becomes a setting automatically,
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
        ISCVLTThemeDefinition, prefix=record_name(theme_id, "").rstrip(".")
    )
    if values:
        update_theme(theme_id, values, registry)
    else:
        sync_color_groups_across_themes(registry)
        sync_block_themes_across_themes(registry)
    return theme_values(theme_id, registry)


def update_theme(theme_id: str, values: dict, registry=None) -> dict:
    """Write field values onto an existing theme.

    Only the keys present in ``values`` are written, so this is a partial
    update. Unknown keys are ignored rather than raising, since they may come
    straight from a request body.

    :param theme_id: the theme id.
    :param values: field values to write.
    :param registry: registry to write, defaulting to the local one.
    :returns: the stored theme values.
    :raises KeyError: if the theme does not exist.
    """
    registry = _registry(registry)
    if not theme_exists(theme_id, registry):
        raise KeyError(theme_id)

    known = set(theme_field_names())
    for name, value in values.items():
        if name not in known:
            continue
        # Normalize list format to dict for registry storage
        if name == "color_groups":
            if isinstance(value, list):
                value = {
                    item["id"]: item
                    for item in value
                    if isinstance(item, dict) and "id" in item
                }
            elif isinstance(value, dict):
                value = dict(value)
            else:
                value = {}

            # Enforce base color groups cannot be deleted
            for bg_id in BASE_COLOR_GROUPS:
                if bg_id not in value and bg_id in DEFAULT_COLOR_GROUPS:
                    value[bg_id] = dict(DEFAULT_COLOR_GROUPS[bg_id])

            # Detect deleted custom color groups and cascade deletion across all themes
            current_groups = get_theme_color_groups(theme_id, registry)
            deleted_groups = [
                gid
                for gid in current_groups
                if gid not in value and gid not in BASE_COLOR_GROUPS
            ]
            for gid in deleted_groups:
                delete_color_group(theme_id, gid, registry)

        elif name == "block_themes":
            if isinstance(value, list):
                value = {
                    item["id"]: item
                    for item in value
                    if isinstance(item, dict) and "id" in item
                }
            elif isinstance(value, dict):
                value = dict(value)
            else:
                value = {}

            # Enforce base block themes cannot be deleted
            for bt_id in BASE_BLOCK_THEMES:
                if bt_id not in value and bt_id in DEFAULT_BLOCK_THEMES:
                    value[bt_id] = dict(DEFAULT_BLOCK_THEMES[bt_id])

            # Detect deleted custom block themes and cascade deletion across all themes
            current_bts = get_theme_block_themes(theme_id, registry)
            deleted_bts = [
                btid
                for btid in current_bts
                if btid not in value and btid not in BASE_BLOCK_THEMES
            ]
            for btid in deleted_bts:
                delete_block_theme(theme_id, btid, registry)
        registry[record_name(theme_id, name)] = value

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

    for name in theme_field_names():
        record = record_name(theme_id, name)
        if record in registry.records:
            del registry.records[record]

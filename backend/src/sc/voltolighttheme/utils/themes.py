"""Enumerate and read theme definitions stored in ``plone.registry``.

Themes have no index of their own: like ``plone.app.querystring`` operations,
they are discovered by walking the registry records and filtering on a prefix
(compare ``plone.app.querystring.registryreader.QuerystringRegistryReader``).

Every theme occupies records named
``sc.voltolighttheme.theme.<theme-id>.<field-name>``.
"""

from plone.registry.interfaces import IRegistry
from sc.voltolighttheme import logger
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
        "background_color_light": "#eceff3",
        "background_color_dark": "#1c2027",
        "text_color_light": "#1d2129",
        "text_color_dark": "#f1f3f5",
        "subtext_color_light": "#4a5260",
        "subtext_color_dark": "#b4bcc8",
        "accent_color_light": "#1864ab",
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
        "background_color_light": "#a5d8ff",
        "background_color_dark": "#1c3a57",
        "text_color_light": "#0b2239",
        "text_color_dark": "#e7f5ff",
        "subtext_color_light": "#1f3f5c",
        "subtext_color_dark": "#b8d7ef",
        "accent_color_light": "#0b2239",
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


def ensure_theme_records(theme_id: str, registry=None) -> None:
    """Ensure all records for a theme definition are registered in the registry."""
    registry = _registry(registry)
    prefix = record_name(theme_id, "").rstrip(".")
    try:
        registry.registerInterface(ISCVLTThemeDefinition, prefix=prefix)
    except Exception:
        logger.exception("Could not register records for theme %r", theme_id)


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
    if rec not in registry.records:
        ensure_theme_records(theme_id, registry)
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
    if not gid or not is_valid_theme_id(gid):
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


def _as_mapping(value) -> dict:
    """Normalize a list of ``{"id": ...}`` items, or a dict, to a dict by id."""
    if isinstance(value, list):
        return {
            item["id"]: item
            for item in value
            if isinstance(item, dict) and "id" in item
        }
    if isinstance(value, dict):
        return dict(value)
    return {}


def _merge_collection(theme_id, value, bases, defaults, read, delete, registry):
    """Prepare a color group / block theme collection for storage.

    Base entries are restored if missing, and custom entries absent from
    ``value`` are deleted (cascading across all themes).
    """
    value = _as_mapping(value)
    for base_id in bases:
        if base_id not in value and base_id in defaults:
            value[base_id] = dict(defaults[base_id])
    removed = [
        key for key in read(theme_id, registry) if key not in value and key not in bases
    ]
    for key in removed:
        delete(theme_id, key, registry)
    return value


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

    ensure_theme_records(theme_id, registry)

    known = set(theme_field_names())
    for name, value in values.items():
        if name not in known:
            continue
        if name == "color_groups":
            value = _merge_collection(
                theme_id,
                value,
                BASE_COLOR_GROUPS,
                DEFAULT_COLOR_GROUPS,
                get_theme_color_groups,
                delete_color_group,
                registry,
            )
        elif name == "block_themes":
            value = _merge_collection(
                theme_id,
                value,
                BASE_BLOCK_THEMES,
                DEFAULT_BLOCK_THEMES,
                get_theme_block_themes,
                delete_block_theme,
                registry,
            )
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

    for name in theme_field_names():
        record = record_name(theme_id, name)
        if record in registry.records:
            del registry.records[record]

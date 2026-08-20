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


def theme_values(theme_id: str, registry=None) -> dict:
    """Read every stored field of one theme.

    Fields with no record are omitted rather than reported as ``None``, so a
    caller can tell "not set" from "not part of this theme".

    :param theme_id: the theme id.
    :param registry: registry to read, defaulting to the local one.
    :returns: field name to value; empty when the theme does not exist.
    """
    registry = _registry(registry)
    values = {}
    for name in theme_field_names():
        record = record_name(theme_id, name)
        if record in registry.records:
            values[name] = registry[record]
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
    return {
        name: value
        for name, value in theme_values(theme_id, registry).items()
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
        registry[record_name(theme_id, name)] = value
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

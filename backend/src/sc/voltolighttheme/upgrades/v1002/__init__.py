from plone.registry.interfaces import IRegistry
from Products.GenericSetup.tool import SetupTool
from sc.voltolighttheme import logger
from sc.voltolighttheme.utils import themes
from zope.component import getUtility


def migrate_themes_to_color_groups(context: SetupTool) -> None:
    """Move every theme's per-colour records into its Color Groups.

    Also registers the ``color_groups`` and ``block_themes`` records on themes
    that predate them, and makes custom groups and block themes available on
    every theme.
    """
    registry = getUtility(IRegistry)
    for theme_id in themes.theme_ids(registry):
        themes.ensure_theme_records(theme_id, registry)
        if themes.migrate_legacy_theme(theme_id, registry):
            logger.info(f"Migrated theme {theme_id!r} to Color Groups.")
    themes.sync_color_groups_across_themes(registry)
    themes.sync_block_themes_across_themes(registry)

from pathlib import Path
from plone import api
from plone.exportimport import importers
from plone.registry.interfaces import IRegistry
from Products.GenericSetup.tool import SetupTool
from sc.voltolighttheme import logger
from sc.voltolighttheme.utils.themes import NATAL_BLOCK_THEMES
from sc.voltolighttheme.utils.themes import NATAL_COLOR_GROUPS
from sc.voltolighttheme.utils.themes import save_theme_block_themes
from sc.voltolighttheme.utils.themes import save_theme_color_groups
from zope.component import queryUtility


EXAMPLE_CONTENT_FOLDER = Path(__file__).parent / "examplecontent"


def create_example_content(portal_setup: SetupTool):
    """Import content available at the examplecontent folder."""
    portal = api.portal.get()
    importer = importers.get_importer(portal)
    for line in importer.import_site(EXAMPLE_CONTENT_FOLDER):
        logger.info(line)


def setup_initial_theme(portal_setup: SetupTool):
    """Ensure natal theme has Christmas colors initialized."""
    registry = queryUtility(IRegistry)
    if registry:
        save_theme_color_groups("natal", NATAL_COLOR_GROUPS, registry)
        save_theme_block_themes("natal", NATAL_BLOCK_THEMES, registry)

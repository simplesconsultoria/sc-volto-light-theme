from plone import api
from Products.GenericSetup.tool import SetupTool
from sc.voltolighttheme import logger


def uninstall_kc_voltolighttheme(context: SetupTool) -> None:
    """Uninstall kitconcept.voltolighttheme."""
    api.addon.uninstall("kitconcept.voltolighttheme")
    logger.info("Uninstalled kitconcept.voltolighttheme add-on.")

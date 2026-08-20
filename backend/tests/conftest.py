from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from plone.dexterity.fti import DexterityFTI
from plone.registry.interfaces import IRegistry
from pytest_plone import fixtures_factory
from sc.voltolighttheme.testing import FUNCTIONAL_TESTING
from sc.voltolighttheme.testing import INTEGRATION_TESTING
from sc.voltolighttheme.utils import themes
from zope.component import getUtility
from zope.component.hooks import setSite

import pytest
import transaction


pytest_plugins = ["pytest_plone"]


globals().update(
    fixtures_factory((
        (FUNCTIONAL_TESTING, "functional"),
        (INTEGRATION_TESTING, "integration"),
    ))
)


THEME_BEHAVIOR = "sc.voltolighttheme.themeselector"


@pytest.fixture
def themed_portal(functional_portal):
    """A portal with a Themed type carrying the theme selector behavior.

    The type is a Container so a section can hold pages: the behavior is meant
    to be usable on any content type, not just the site root, which is what
    makes a per-section theme override possible.
    """
    setRoles(functional_portal, TEST_USER_ID, ["Manager"])
    fti = DexterityFTI("Themed")
    fti.klass = "plone.dexterity.content.Container"
    fti.global_allow = True
    fti.filter_content_types = False
    fti.behaviors = (THEME_BEHAVIOR,)
    functional_portal.portal_types._setObject("Themed", fti)
    setSite(functional_portal)
    transaction.commit()
    return functional_portal


@pytest.fixture
def theme_registry(themed_portal):
    """The registry, with one extra theme beside the shipped default."""
    registry = getUtility(IRegistry)
    themes.create_theme(
        "corporate",
        {"name": "Corporate", "primary_color": "#123456"},
        registry=registry,
    )
    transaction.commit()
    return registry

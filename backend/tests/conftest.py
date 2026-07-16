from pytest_plone import fixtures_factory
from sc.voltolighttheme.testing import FUNCTIONAL_TESTING
from sc.voltolighttheme.testing import INTEGRATION_TESTING


pytest_plugins = ["pytest_plone"]


globals().update(
    fixtures_factory((
        (FUNCTIONAL_TESTING, "functional"),
        (INTEGRATION_TESTING, "integration"),
    ))
)

import pytest


@pytest.fixture(scope="class")
def portal(portal_class):
    yield portal_class


@pytest.fixture(scope="class")
def registered_behaviors(portal):
    """Return a list of registered behaviors."""
    from plone.behavior.interfaces import IBehavior
    from zope.component import getUtilitiesFor

    return [name for name, _ in getUtilitiesFor(IBehavior)]


class TestBehaviorsAvailability:
    @pytest.fixture(autouse=True)
    def _setup(self, portal, registered_behaviors):
        self.portal = portal
        self.behaviors = registered_behaviors

    @pytest.mark.parametrize(
        "behavior,expected",
        [
            ("sc.voltolighttheme.siteheader", True),
            ("sc.voltolighttheme.intranetheader", True),
            ("sc.voltolighttheme.themeselector", True),
            ("sc.voltolighttheme.footer", True),
            ("voltolighttheme.header", False),
            ("voltolighttheme.theme", False),
            ("voltolighttheme.footer", False),
            ("kitconcept.footer", False),
            ("kitconcept.sticky_menu", True),
        ],
    )
    def test_behavior_availability(self, behavior: str, expected: bool):
        """Test that the behavior is available in the portal."""
        assert (behavior in self.behaviors) == expected

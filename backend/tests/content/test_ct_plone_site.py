from plone.dexterity.fti import DexterityFTI

import pytest


@pytest.fixture(scope="session")
def content_type() -> str:
    """Return the content type to be used in tests."""
    return "Plone Site"


@pytest.fixture(scope="class")
def portal(portal_class):
    """Fixture to provide a Plone portal instance."""
    yield portal_class


class TestContentTypeFTI:
    @pytest.fixture(autouse=True)
    def _setup(self, portal, get_fti, content_type) -> None:
        self.portal = portal
        self.portal_type = content_type
        self.fti: DexterityFTI = get_fti(self.portal_type)

    @pytest.mark.parametrize(
        "attr,expected",
        [
            ("title", "Plone Site"),
            ("klass", "Products.CMFPlone.Portal.PloneSite"),
            ("global_allow", False),
        ],
    )
    def test_fti(self, attr: str, expected):
        """Test FTI values."""
        fti = self.fti

        assert isinstance(fti, DexterityFTI)
        assert getattr(fti, attr) == expected

    def test_behaviors(self):
        """Test behaviors are present and in correct order."""
        assert self.fti.behaviors == (
            "voltolighttheme.header",
            "voltolighttheme.theme",
            "kitconcept.footer",
            "sc.voltolighttheme.footer",
            "voltolighttheme.footer",
            "plonegovbr.socialmedia.settings",
            "volto.preview_image_link",
            "plone.dublincore",
            "plone.relateditems",
            "plone.locking",
            "plone.excludefromnavigation",
            "volto.blocks",
        )

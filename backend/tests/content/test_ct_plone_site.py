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
            ("description", ""),
            ("factory", "manage_addSite"),
            ("klass", "Products.CMFPlone.Portal.PloneSite"),
            ("filter_content_types", False),
            ("allowed_content_types", ()),
        ],
    )
    def test_fti(self, attr: str, expected):
        """Test FTI values."""
        fti = self.fti

        assert isinstance(fti, DexterityFTI)
        assert getattr(fti, attr) == expected

    @pytest.mark.parametrize(
        "idx,behavior",
        enumerate((
            "plonegovbr.socialmedia.settings",
            "sc.voltolighttheme.themeselector",
            "sc.voltolighttheme.siteheader",
            "sc.voltolighttheme.footer",
            "volto.preview_image_link",
            "plone.dublincore",
            "plone.relateditems",
            "plone.locking",
            "plone.excludefromnavigation",
            "volto.blocks",
        )),
    )
    def test_behaviors(self, idx: int, behavior: str):
        assert self.fti.behaviors[idx] == behavior


@pytest.mark.portal(profiles=["sc.voltolighttheme:intranet"])
class TestContentTypeIntranetFTI(TestContentTypeFTI):
    @pytest.mark.parametrize(
        "idx,behavior",
        enumerate((
            "plonegovbr.socialmedia.settings",
            "sc.voltolighttheme.themeselector",
            "sc.voltolighttheme.intranetheader",
            "sc.voltolighttheme.footer",
            "volto.preview_image_link",
            "plone.dublincore",
            "plone.relateditems",
            "plone.locking",
            "plone.excludefromnavigation",
            "volto.blocks",
        )),
    )
    def test_behaviors(self, idx: int, behavior: str):
        assert self.fti.behaviors[idx] == behavior

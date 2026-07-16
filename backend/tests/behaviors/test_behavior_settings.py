import pytest


@pytest.fixture(scope="session")
def content_type() -> str:
    """Return the content type to be used in tests."""
    return "Plone Site"


class TestContentTypeSerialization:
    portal_type: str = "Plone Site"

    @pytest.fixture(autouse=True)
    def _setup(self, functional_portal, manager_request, content_type) -> None:
        self.portal = functional_portal
        self.request = manager_request
        self.endpoint = f"/@types/{content_type}"

    @pytest.mark.parametrize(
        "field,visible",
        [
            ("title", True),
            ("accent_color", False),
            ("accent_foreground_color", False),
            ("complementary_logo", False),
            ("footer_address", False),
            ("has_intranet_header", False),
            ("header_actions", False),
            ("header_foreground", False),
            ("intranet_flag", False),
            ("post_footer_logo_link", False),
            ("post_footer_logo", False),
            ("secondary_color", False),
            ("secondary_foreground_color", False),
            ("logo", True),
            ("footer_logo", True),
            ("footer_brand_slogan", True),
            ("footer_brand_message", True),
        ],
    )
    def test_field_visibility(self, field: str, visible: bool):
        """Test if field visibility is correct."""
        data = self.request.get(self.endpoint).json()
        properties = data.get("properties", {})
        property_names = list(properties.keys())
        assert (field in property_names) is visible

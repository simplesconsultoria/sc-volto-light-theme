from sc.voltolighttheme import PACKAGE_NAME
from tests.behaviors import header_actions

import pytest


@pytest.fixture(scope="session")
def behavior() -> str:
    return f"{PACKAGE_NAME}.intranetheader"


@pytest.fixture(scope="session")
def payload() -> dict:
    return {
        "logo": None,
        "has_fat_menu": True,
        "header_actions": header_actions,
        "complementary_logo": None,
        "has_intranet_header": True,
        "intranet_flag": "Intranet",
    }


@pytest.fixture
def portal(portal_factory, payload, behavior):
    """Fixture to provide a Plone portal instance with the specified behavior and payload."""
    data = {**payload, "id": "dummy-content-001"}
    yield portal_factory(behavior=behavior, payload=data)


class TestBehavior:
    name: str = f"{PACKAGE_NAME}.siteheader"

    @pytest.fixture(autouse=True)
    def _setup(self, portal, dummy_type_schema):
        self.portal = portal
        self.schemas = {
            "manager": dummy_type_schema(type_request="manager"),
            "editor": dummy_type_schema(type_request="editor"),
        }

    @pytest.mark.parametrize(
        "type_request,field,expected",
        (
            ("manager", "logo", True),
            ("editor", "logo", False),
            ("manager", "has_fat_menu", True),
            ("editor", "has_fat_menu", False),
            ("manager", "header_actions", True),
            ("editor", "header_actions", False),
            ("manager", "complementary_logo", True),
            ("editor", "complementary_logo", False),
            ("manager", "has_intranet_header", True),
            ("editor", "has_intranet_header", False),
            ("manager", "intranet_flag", True),
            ("editor", "intranet_flag", False),
        ),
    )
    def test_behavior_schema_field_visibility(
        self, type_request: str, field: str, expected: bool
    ):
        schema = self.schemas[type_request]
        assert (field in schema["properties"]) is expected

    def test_behavior_validation(self, payload: dict, create_dummy_content):
        response = create_dummy_content(payload)
        assert response.status_code == 201

    @pytest.mark.parametrize(
        "type_request,field,expected",
        (
            ("manager", "logo", True),
            ("editor", "logo", True),
            ("anonymous", "logo", True),
            ("manager", "has_fat_menu", True),
            ("editor", "has_fat_menu", True),
            ("anonymous", "has_fat_menu", True),
            ("manager", "header_actions", True),
            ("editor", "header_actions", True),
            ("anonymous", "header_actions", True),
            ("manager", "complementary_logo", True),
            ("editor", "complementary_logo", True),
            ("anonymous", "complementary_logo", True),
            ("manager", "has_intranet_header", True),
            ("editor", "has_intranet_header", True),
            ("anonymous", "has_intranet_header", True),
            ("manager", "intranet_flag", True),
            ("editor", "intranet_flag", True),
            ("anonymous", "intranet_flag", True),
        ),
    )
    def test_behavior_view_field_visibility(
        self, role_request, type_request: str, field: str, expected: bool
    ):
        request_func = role_request(type_request)
        response = request_func.get("/dummy-content-001")
        data = response.json()
        assert (field in data) is expected

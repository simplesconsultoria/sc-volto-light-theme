from plone import api
from sc.voltolighttheme import PACKAGE_NAME
from sc.voltolighttheme.utils import themes

import pytest
import transaction


@pytest.fixture(scope="session")
def behavior() -> str:
    return f"{PACKAGE_NAME}.themeselector"


@pytest.fixture(scope="session")
def vocabulary_name() -> str:
    return f"{PACKAGE_NAME}.themes"


@pytest.fixture(scope="session")
def payload() -> dict:
    return {
        "theme": "corporate",
    }


@pytest.fixture
def portal(themed_portal):
    """Fixture to provide a Plone portal instance with the specified behavior and payload.

    The behavior and payload are the ones `themed_portal` already builds: the
    theme has to reach the registry before the content that selects it.
    """
    yield themed_portal


class TestBehavior:
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
            ("manager", "theme", True),
            ("editor", "theme", False),
        ),
    )
    def test_behavior_schema_field_visibility(
        self, type_request: str, field: str, expected: bool
    ):
        schema = self.schemas[type_request]
        assert (field in schema["properties"]) is expected

    def test_theme_field_points_at_the_vocabulary(self, vocabulary_name: str):
        # Volto resolves the terms lazily through @vocabularies rather than
        # inlining them, so the schema carries a reference, not choices.
        vocabulary = self.schemas["manager"]["properties"]["theme"]["vocabulary"]
        assert vocabulary["@id"].endswith(f"/@vocabularies/{vocabulary_name}")

    def test_behavior_validation(self, payload: dict, create_dummy_content):
        response = create_dummy_content(payload)
        assert response.status_code == 201

    @pytest.mark.parametrize(
        "type_request,field,expected",
        (
            ("manager", "theme", True),
            ("editor", "theme", True),
            ("anonymous", "theme", True),
        ),
    )
    def test_behavior_view_field_visibility(
        self, role_request, type_request: str, field: str, expected: bool
    ):
        request_func = role_request(type_request)
        response = request_func.get("/dummy-content-001")
        data = response.json()
        assert (field in data) is expected


class TestVocabulary:
    @pytest.fixture(autouse=True)
    def _setup(self, portal, manager_request, vocabulary_name):
        self.portal = portal
        self.api = manager_request
        self.terms = self.api.get(f"/@vocabularies/{vocabulary_name}").json()["items"]

    def test_the_vocabulary_endpoint_lists_the_themes(self):
        tokens = [term["token"] for term in self.terms]
        assert themes.DEFAULT_THEME_ID in tokens
        assert "corporate" in tokens

    def test_the_vocabulary_endpoint_uses_the_theme_name_as_title(self):
        titles = {term["token"]: term["title"] for term in self.terms}
        assert titles["corporate"] == "Corporate"


class TestInheritExpander:
    """What the frontend consumes, through `useLiveData`."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal, theme_registry, manager_request, behavior):
        self.portal = portal
        self.registry = theme_registry
        self.api = manager_request
        self.behavior = behavior
        self.parent = api.content.create(
            container=self.portal, type="DummyType", id="section", theme="corporate"
        )
        self.child = api.content.create(
            container=self.parent, type="Document", id="page"
        )
        transaction.commit()

    def _inherit(self, path: str) -> dict:
        response = self.api.get(
            f"{path}?expand=inherit&expand.inherit.behaviors={self.behavior}"
        )
        return response.json()["@components"]["inherit"][self.behavior]

    def test_a_child_inherits_the_section_theme(self):
        data = self._inherit("/section/page")
        assert data["data"]["theme"]["title"] == "Corporate"

    def test_the_expander_reports_the_providing_object(self):
        data = self._inherit("/section/page")
        assert data["from"]["@id"].endswith("/section")

    def test_a_nested_section_overrides_its_parent(self):
        themes.create_theme(
            "sub",
            {"name": "Sub", "primary_color_light": "#0f0f0f"},
            registry=self.registry,
        )
        subsection = api.content.create(
            container=self.parent, type="DummyType", id="sub", theme="sub"
        )
        api.content.create(container=subsection, type="Document", id="deep")
        transaction.commit()

        data = self._inherit("/section/sub/deep")
        assert data["data"]["theme"]["title"] == "Sub"
        assert data["data"]["theme"]["value"]["primary_color_light"] == "#0f0f0f"

    def test_content_outside_a_themed_section_falls_back_to_the_site(self):
        # The behavior is enabled on Plone Site, so the site root is always the
        # last provider up the chain — content is never left without a theme.
        api.content.create(container=self.portal, type="Document", id="loose")
        transaction.commit()
        data = self._inherit("/loose")
        assert data["from"]["@id"].endswith("/plone")

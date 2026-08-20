"""The `sc.voltolighttheme.themeselector` behavior.

Covers the behavior's schema and how the `@inherit` expander resolves it up the
acquisition chain. The serialization of the field itself lives in
`tests/serializers/test_fields.py`, next to the adapter that produces it.
"""

from plone import api
from sc.voltolighttheme.utils import themes

import pytest
import transaction


BEHAVIOR = "sc.voltolighttheme.themeselector"


class TestBehaviorSchema:
    @pytest.fixture(autouse=True)
    def _setup(self, themed_portal, theme_registry, manager_request):
        self.api = manager_request
        self.schema = self.api.get("/@types/Themed").json()

    def test_schema_is_served(self):
        assert "properties" in self.schema

    def test_theme_field_is_present(self):
        assert "theme" in self.schema["properties"]

    def test_theme_field_points_at_the_vocabulary(self):
        # Volto resolves the terms lazily through @vocabularies rather than
        # inlining them, so the schema carries a reference, not choices.
        vocabulary = self.schema["properties"]["theme"]["vocabulary"]
        assert vocabulary["@id"].endswith("/@vocabularies/sc.voltolighttheme.themes")

    def test_the_vocabulary_endpoint_lists_the_themes(self):
        terms = self.api.get("/@vocabularies/sc.voltolighttheme.themes").json()
        tokens = [term["token"] for term in terms["items"]]
        assert themes.DEFAULT_THEME_ID in tokens
        assert "corporate" in tokens

    def test_the_vocabulary_endpoint_uses_the_theme_name_as_title(self):
        terms = self.api.get("/@vocabularies/sc.voltolighttheme.themes").json()
        titles = {term["token"]: term["title"] for term in terms["items"]}
        assert titles["corporate"] == "Corporate"


class TestInheritExpander:
    """What the frontend consumes, through `useLiveData`."""

    @pytest.fixture(autouse=True)
    def _setup(self, themed_portal, theme_registry, manager_request):
        self.portal = themed_portal
        self.registry = theme_registry
        self.api = manager_request
        self.parent = api.content.create(
            container=self.portal, type="Themed", id="section", theme="corporate"
        )
        self.child = api.content.create(
            container=self.parent, type="Document", id="page"
        )
        transaction.commit()

    def _inherit(self, path):
        response = self.api.get(
            f"{path}?expand=inherit&expand.inherit.behaviors={BEHAVIOR}"
        )
        return response.json()["@components"]["inherit"]

    def test_a_child_inherits_the_section_theme(self):
        data = self._inherit("/section/page")
        assert data[BEHAVIOR]["data"]["theme"]["title"] == "Corporate"

    def test_the_expander_reports_the_providing_object(self):
        data = self._inherit("/section/page")
        assert data[BEHAVIOR]["from"]["@id"].endswith("/section")

    def test_a_nested_section_overrides_its_parent(self):
        themes.create_theme(
            "sub",
            {"name": "Sub", "primary_color": "#0f0f0f"},
            registry=self.registry,
        )
        subsection = api.content.create(
            container=self.parent, type="Themed", id="sub", theme="sub"
        )
        api.content.create(container=subsection, type="Document", id="deep")
        transaction.commit()

        data = self._inherit("/section/sub/deep")
        assert data[BEHAVIOR]["data"]["theme"]["title"] == "Sub"
        assert data[BEHAVIOR]["data"]["theme"]["value"]["primary_color"] == "#0f0f0f"

    def test_content_outside_a_themed_section_falls_back_to_the_site(self):
        # The behavior is enabled on Plone Site, so the site root is always the
        # last provider up the chain — content is never left without a theme.
        api.content.create(container=self.portal, type="Document", id="loose")
        transaction.commit()
        data = self._inherit("/loose")
        assert data[BEHAVIOR]["from"]["@id"].endswith("/plone")

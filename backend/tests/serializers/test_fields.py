"""Field serializers.

`ThemeFieldSerializer` resolves the stored theme id against the registry and
emits the `{token, title, value}` shape every Volto choice widget expects.
"""

from plone import api
from plone.registry.interfaces import IRegistry
from sc.voltolighttheme.utils import themes
from zope.component import getUtility

import pytest
import transaction


class TestThemeFieldSerializer:
    @pytest.fixture(autouse=True)
    def _setup(self, themed_portal, theme_registry, manager_request):
        self.portal = themed_portal
        self.registry = theme_registry
        self.api = manager_request
        api.content.create(
            container=self.portal, type="Themed", id="site", theme="corporate"
        )
        transaction.commit()

    def test_theme_carries_the_widget_token(self):
        # Volto resolves the selected option as
        # `value.token ?? value.value ?? value.UID ?? 'no-value'`, so a payload
        # without `token` renders as "No value" however complete it is.
        assert self.api.get("/site").json()["theme"]["token"] == "corporate"

    def test_theme_carries_the_widget_title(self):
        assert self.api.get("/site").json()["theme"]["title"] == "Corporate"

    def test_theme_serializes_to_its_colors(self):
        value = self.api.get("/site").json()["theme"]["value"]
        assert value["primary_color_light"] == "#123456"

    def test_the_value_carries_no_metadata(self):
        # `name` is already the `title`, and every key of `value` becomes a CSS
        # custom property on the frontend.
        value = self.api.get("/site").json()["theme"]["value"]
        assert "name" not in value
        assert "description" not in value

    def test_the_payload_has_exactly_the_three_documented_keys(self):
        # The frontend `SerializedTheme` type mirrors this; a fourth key here
        # would silently go unread.
        assert set(self.api.get("/site").json()["theme"]) == {
            "token",
            "title",
            "value",
        }

    def test_theme_reflects_a_registry_update(self):
        themes.update_theme(
            "corporate", {"primary_color_light": "#abcdef"}, registry=self.registry
        )
        transaction.commit()
        data = self.api.get("/site").json()
        assert data["theme"]["value"]["primary_color_light"] == "#abcdef"

    def test_an_unset_theme_serializes_to_none(self):
        api.content.create(container=self.portal, type="Themed", id="plain")
        transaction.commit()
        assert self.api.get("/plain").json()["theme"] is None

    def test_a_deleted_theme_does_not_break_the_response(self):
        # Themes are not catalogued, so a theme can be deleted while still
        # selected. The response must still be served.
        themes.delete_theme("corporate", registry=self.registry)
        transaction.commit()
        response = self.api.get("/site")
        assert response.status_code == 200

    def test_a_deleted_theme_keeps_its_token(self):
        themes.delete_theme("corporate", registry=self.registry)
        transaction.commit()
        theme = self.api.get("/site").json()["theme"]
        assert theme["token"] == "corporate"
        assert theme["value"] == {}

    def test_a_deleted_theme_falls_back_to_the_id_as_title(self):
        themes.delete_theme("corporate", registry=self.registry)
        transaction.commit()
        assert self.api.get("/site").json()["theme"]["title"] == "corporate"


class TestThemeFieldRoundTrip:
    """Saving an edit form must not lose the selection.

    Volto PATCHes the whole form, so an untouched theme field is sent back
    exactly as it was serialized. `ChoiceFieldDeserializer` unwraps
    `value["token"]` from a mapping, which is why the key has to be there.
    """

    @pytest.fixture(autouse=True)
    def _setup(self, themed_portal, theme_registry, manager_request):
        self.portal = themed_portal
        self.api = manager_request
        api.content.create(
            container=self.portal, type="Themed", id="site", theme="corporate"
        )
        transaction.commit()

    def test_patching_back_the_serialized_field_is_accepted(self):
        serialized = self.api.get("/site").json()["theme"]
        response = self.api.patch("/site", json={"theme": serialized})
        assert response.status_code in (200, 204)

    def test_patching_back_the_serialized_field_keeps_the_theme(self):
        serialized = self.api.get("/site").json()["theme"]
        self.api.patch("/site", json={"theme": serialized})
        transaction.commit()
        assert self.api.get("/site").json()["theme"]["token"] == "corporate"

    def test_a_bare_token_is_accepted(self):
        # What the widget sends once the user picks a different option.
        themes.create_theme("other", {"name": "Other"}, registry=getUtility(IRegistry))
        transaction.commit()
        self.api.patch("/site", json={"theme": "other"})
        transaction.commit()
        assert self.api.get("/site").json()["theme"]["token"] == "other"

    def test_clearing_the_theme_is_accepted(self):
        self.api.patch("/site", json={"theme": None})
        transaction.commit()
        assert self.api.get("/site").json()["theme"] is None


class TestColorJsonSchemaProvider:
    """`Color` fields must reach Volto as a colour picker."""

    @pytest.fixture(autouse=True)
    def _setup(self, themed_portal, theme_registry, manager_request):
        self.api = manager_request

    def test_color_fields_use_the_color_picker_widget(self):
        schema = self.api.get("/@controlpanels/themes").json()["schema"]
        assert schema["properties"]["primary_color_light"]["widget"] == "colorPicker"

    def test_color_fields_declare_the_color_factory(self):
        schema = self.api.get("/@controlpanels/themes").json()["schema"]
        assert schema["properties"]["primary_color_light"]["factory"] == "Color"

    def test_non_color_fields_are_untouched(self):
        schema = self.api.get("/@controlpanels/themes").json()["schema"]
        assert schema["properties"]["name"].get("widget") != "colorPicker"

"""The `@controlpanels/themes` API.

These tests pin the response shape the frontend control panel is built
against, so treat a change here as a contract change.
"""

from plone.registry.interfaces import IRegistry
from sc.voltolighttheme.utils import themes
from zope.component import getUtility

import pytest
import transaction


PANEL = "/@controlpanels/themes"


@pytest.fixture
def portal(functional):
    return functional["portal"]


@pytest.fixture
def api(manager_request):
    return manager_request


class TestListing:
    @pytest.fixture(autouse=True)
    def _setup(self, portal, api):
        self.portal = portal
        self.api = api
        self.response = api.get(PANEL)
        self.data = self.response.json()

    def test_panel_is_reachable(self):
        assert self.response.status_code == 200

    def test_listing_has_an_id(self):
        assert self.data["@id"].endswith(PANEL)

    def test_listing_has_a_title(self):
        assert self.data["title"] == "Themes"

    def test_listing_exposes_the_schema(self):
        assert "properties" in self.data["schema"]

    def test_schema_carries_the_theme_fields(self):
        properties = self.data["schema"]["properties"]
        assert "name" in properties
        assert "primary_color_light" in properties
        assert "font_family_primary" in properties
        assert "neutral_accent_color_dark" in properties

    def test_color_fields_use_the_color_picker_widget(self):
        primary = self.data["schema"]["properties"]["primary_color_light"]
        assert primary.get("widget") == "colorPicker"

    def test_listing_returns_the_default_theme(self):
        ids = [item["id"] for item in self.data["items"]]
        assert themes.DEFAULT_THEME_ID in ids

    def test_items_total_matches(self):
        assert self.data["items_total"] == len(self.data["items"])

    def test_each_item_has_a_traversable_id(self):
        item = self.data["items"][0]
        assert item["@id"].endswith(f"{PANEL}/{item['id']}")

    def test_each_item_carries_its_values(self):
        item = next(i for i in self.data["items"] if i["id"] == themes.DEFAULT_THEME_ID)
        assert item["name"] == "Default"
        assert item["primary_color_light"] == "#ffffff"

    def test_panel_is_listed_among_the_controlpanels(self):
        response = self.api.get("/@controlpanels")
        names = [panel["@id"].rsplit("/", 1)[-1] for panel in response.json()]
        assert "themes" in names


class TestGet:
    @pytest.fixture(autouse=True)
    def _setup(self, portal, api):
        self.api = api

    def test_get_a_theme(self):
        response = self.api.get(f"{PANEL}/{themes.DEFAULT_THEME_ID}")
        assert response.status_code == 200
        assert response.json()["id"] == themes.DEFAULT_THEME_ID

    def test_get_returns_the_values(self):
        response = self.api.get(f"{PANEL}/{themes.DEFAULT_THEME_ID}")
        assert response.json()["primary_color_light"] == "#ffffff"

    def test_get_a_missing_theme_is_404(self):
        response = self.api.get(f"{PANEL}/not-here")
        assert response.status_code == 404


class TestAdd:
    @pytest.fixture(autouse=True)
    def _setup(self, portal, api):
        self.api = api

    def test_create_a_theme(self):
        response = self.api.post(PANEL, json={"id": "corporate", "name": "Corporate"})
        assert response.status_code == 201

    def test_create_returns_the_theme(self):
        response = self.api.post(PANEL, json={"id": "corporate", "name": "Corporate"})
        assert response.json()["id"] == "corporate"
        assert response.json()["name"] == "Corporate"

    def test_create_sets_the_location_header(self):
        response = self.api.post(PANEL, json={"id": "corporate"})
        assert response.headers["Location"].endswith(f"{PANEL}/corporate")

    def test_create_stores_the_colors(self):
        response = self.api.post(
            PANEL, json={"id": "corporate", "primary_color_light": "#123456"}
        )
        assert response.json()["primary_color_light"] == "#123456"

    def test_created_theme_is_readable(self):
        self.api.post(PANEL, json={"id": "corporate", "name": "Corporate"})
        transaction.commit()
        response = self.api.get(f"{PANEL}/corporate")
        assert response.status_code == 200

    def test_create_without_an_id_is_rejected(self):
        response = self.api.post(PANEL, json={"name": "No id"})
        assert response.status_code == 400

    def test_create_with_a_dotted_id_is_rejected(self):
        response = self.api.post(PANEL, json={"id": "has.dot"})
        assert response.status_code == 400

    def test_create_with_an_uppercase_id_is_rejected(self):
        response = self.api.post(PANEL, json={"id": "Corporate"})
        assert response.status_code == 400

    def test_create_a_duplicate_is_rejected(self):
        response = self.api.post(PANEL, json={"id": themes.DEFAULT_THEME_ID})
        assert response.status_code == 400


class TestUpdate:
    @pytest.fixture(autouse=True)
    def _setup(self, portal, api):
        self.api = api
        self.api.post(
            PANEL,
            json={
                "id": "corporate",
                "name": "Corporate",
                "primary_color_light": "#123456",
            },
        )
        transaction.commit()

    def test_update_a_field(self):
        response = self.api.patch(
            f"{PANEL}/corporate", json={"primary_color_light": "#abcdef"}
        )
        assert response.status_code in (200, 204)

    def test_update_is_persisted(self):
        self.api.patch(f"{PANEL}/corporate", json={"primary_color_light": "#abcdef"})
        transaction.commit()
        assert (
            self.api.get(f"{PANEL}/corporate").json()["primary_color_light"]
            == "#abcdef"
        )

    def test_update_is_partial(self):
        self.api.patch(f"{PANEL}/corporate", json={"primary_color_light": "#abcdef"})
        transaction.commit()
        assert self.api.get(f"{PANEL}/corporate").json()["name"] == "Corporate"

    def test_update_cannot_change_the_id(self):
        self.api.patch(f"{PANEL}/corporate", json={"id": "renamed"})
        transaction.commit()
        assert self.api.get(f"{PANEL}/corporate").status_code == 200
        assert self.api.get(f"{PANEL}/renamed").status_code == 404

    def test_the_default_theme_can_be_edited(self):
        # Only deletion is blocked: its name, description and settings must
        # stay editable like any other theme.
        response = self.api.patch(
            f"{PANEL}/{themes.DEFAULT_THEME_ID}", json={"name": "Renamed"}
        )
        assert response.status_code in (200, 204)

    def test_editing_the_default_theme_is_persisted(self):
        self.api.patch(
            f"{PANEL}/{themes.DEFAULT_THEME_ID}",
            json={"name": "Renamed", "primary_color_light": "#abcdef"},
        )
        transaction.commit()
        data = self.api.get(f"{PANEL}/{themes.DEFAULT_THEME_ID}").json()
        assert data["name"] == "Renamed"
        assert data["primary_color_light"] == "#abcdef"

    def test_update_a_missing_theme_is_404(self):
        response = self.api.patch(f"{PANEL}/not-here", json={"name": "X"})
        assert response.status_code == 404


class TestDelete:
    @pytest.fixture(autouse=True)
    def _setup(self, portal, api):
        self.api = api
        self.registry = getUtility(IRegistry)
        self.api.post(PANEL, json={"id": "corporate", "name": "Corporate"})
        transaction.commit()

    def test_delete_a_theme(self):
        response = self.api.delete(f"{PANEL}/corporate")
        assert response.status_code in (200, 204)

    def test_deleted_theme_is_gone(self):
        self.api.delete(f"{PANEL}/corporate")
        transaction.commit()
        assert self.api.get(f"{PANEL}/corporate").status_code == 404

    def test_delete_leaves_the_other_themes(self):
        self.api.delete(f"{PANEL}/corporate")
        transaction.commit()
        assert self.api.get(f"{PANEL}/{themes.DEFAULT_THEME_ID}").status_code == 200

    def test_the_default_theme_cannot_be_deleted(self):
        response = self.api.delete(f"{PANEL}/{themes.DEFAULT_THEME_ID}")
        assert response.status_code == 400

    def test_the_default_theme_survives(self):
        self.api.delete(f"{PANEL}/{themes.DEFAULT_THEME_ID}")
        transaction.commit()
        assert self.api.get(f"{PANEL}/{themes.DEFAULT_THEME_ID}").status_code == 200

    def test_delete_a_missing_theme_is_404(self):
        response = self.api.delete(f"{PANEL}/not-here")
        assert response.status_code == 404


class TestPermissions:
    @pytest.fixture(autouse=True)
    def _setup(self, portal, anon_request):
        self.anon = anon_request

    def test_anonymous_cannot_read_the_panel(self):
        assert self.anon.get(PANEL).status_code in (401, 403, 404)

    def test_anonymous_cannot_create_a_theme(self):
        response = self.anon.post(PANEL, json={"id": "sneaky"})
        assert response.status_code in (401, 403, 404)

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
        assert "description" in properties
        assert "color_groups" in properties
        assert "block_themes" in properties

    def test_color_groups_field_in_schema(self):
        color_groups = self.data["schema"]["properties"]["color_groups"]
        assert "title" in color_groups

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
        assert "color_groups" in item

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
        assert response.json()["name"] == "Default"
        assert "color_groups" in response.json()

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

    def test_create_stores_the_description(self):
        response = self.api.post(
            PANEL, json={"id": "corporate", "description": "Corporate theme"}
        )
        assert response.json()["description"] == "Corporate theme"

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
                "description": "Initial description",
            },
        )
        transaction.commit()

    def test_update_a_field(self):
        response = self.api.patch(
            f"{PANEL}/corporate", json={"description": "Updated"}
        )
        assert response.status_code in (200, 204)

    def test_update_is_persisted(self):
        self.api.patch(f"{PANEL}/corporate", json={"description": "Updated"})
        transaction.commit()
        assert (
            self.api.get(f"{PANEL}/corporate").json()["description"]
            == "Updated"
        )

    def test_update_is_partial(self):
        self.api.patch(f"{PANEL}/corporate", json={"description": "Updated"})
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
            json={"name": "Renamed", "description": "Updated default"},
        )
        transaction.commit()
        data = self.api.get(f"{PANEL}/{themes.DEFAULT_THEME_ID}").json()
        assert data["name"] == "Renamed"
        assert data["description"] == "Updated default"

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


class TestColorGroupsAndBlockThemesControlpanel:
    @pytest.fixture(autouse=True)
    def _setup(self, portal, api):
        self.api = api
        self.api.post(
            PANEL,
            json={
                "id": "festive",
                "name": "Festive",
            },
        )
        transaction.commit()

    def test_get_theme_includes_color_groups_and_block_themes(self):
        response = self.api.get(f"{PANEL}/{themes.DEFAULT_THEME_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "color_groups" in data
        assert "primary" in data["color_groups"]
        assert "block_themes" in data
        assert "default" in data["block_themes"]

    def test_patch_new_color_group_syncs_across_themes(self):
        # Add new color group 'dourado' to festive
        festive_groups = self.api.get(f"{PANEL}/festive").json()["color_groups"]
        festive_groups["dourado"] = {
            "id": "dourado",
            "name": "Dourado",
            "background_color_light": "#ffd700",
            "background_color_dark": "#b8860b",
            "text_color_light": "#000000",
            "text_color_dark": "#ffffff",
            "subtext_color_light": "#333333",
            "subtext_color_dark": "#cccccc",
            "accent_color_light": "#ff8c00",
            "accent_color_dark": "#ff8c00",
        }
        patch_res = self.api.patch(
            f"{PANEL}/festive",
            json={"color_groups": festive_groups},
        )
        assert patch_res.status_code in (200, 204)
        transaction.commit()

        # Festive now has 'dourado' with its custom background
        festive_updated = self.api.get(f"{PANEL}/festive").json()
        assert festive_updated["color_groups"]["dourado"]["background_color_light"] == "#ffd700"

        # Default theme must automatically have 'dourado' synced with defaults
        default_updated = self.api.get(f"{PANEL}/{themes.DEFAULT_THEME_ID}").json()
        assert "dourado" in default_updated["color_groups"]
        assert default_updated["color_groups"]["dourado"]["name"] == "Dourado"
        assert default_updated["color_groups"]["dourado"]["background_color_light"] == "#ffffff"


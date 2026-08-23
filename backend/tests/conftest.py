from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from plone.dexterity.fti import DexterityFTI
from plone.registry.interfaces import IRegistry
from pytest_plone import fixtures_factory
from sc.voltolighttheme import PACKAGE_NAME
from sc.voltolighttheme.testing import FUNCTIONAL_TESTING
from sc.voltolighttheme.testing import INTEGRATION_TESTING
from sc.voltolighttheme.utils import themes
from typing import Any
from zope.component import getUtility
from zope.component.hooks import setSite

import pytest
import transaction


pytest_plugins = ["pytest_plone"]


globals().update(
    fixtures_factory((
        (FUNCTIONAL_TESTING, "functional"),
        (INTEGRATION_TESTING, "integration"),
    ))
)


@pytest.fixture(scope="session")
def editor_credentials() -> tuple[str, str]:
    """Return the credentials for the editor user."""
    return ("editor", "nomoresecrets")


@pytest.fixture
def portal_factory(functional_portal, editor_credentials):
    def func(behavior: str, payload: dict, container: bool = False):
        """Build a portal with a ``DummyType`` carrying ``behavior``.

        :param behavior: the behavior name to enable on the type.
        :param payload: field values for a piece of content, published for
            Anonymous; no content is created when empty.
        :param container: build the type as a Container instead of an Item, so
            a section can hold pages — what a per-section override needs.
        :returns: the portal.
        """
        setRoles(functional_portal, TEST_USER_ID, ["Manager"])
        fti = DexterityFTI("DummyType")
        fti.behaviors = (behavior,)
        if container:
            fti.klass = "plone.dexterity.content.Container"
            fti.global_allow = True
            fti.filter_content_types = False
        functional_portal.portal_types._setObject("DummyType", fti)
        setSite(functional_portal)
        api.user.create(
            email=editor_credentials[0] + "@example.com",
            username=editor_credentials[0],
            password=editor_credentials[1],
            roles=["Editor"],
        )
        if payload:
            content = api.content.create(
                container=functional_portal,
                type="DummyType",
                **payload,
            )
            # Equivalent to publishing the content
            content.manage_permission("View", roles=["Anonymous"], acquire=False)
        transaction.commit()
        return functional_portal

    return func


@pytest.fixture
def editor_request(request_factory, editor_credentials):
    return request_factory(basic_auth=editor_credentials)


@pytest.fixture
def role_request(manager_request, editor_request, anon_request):
    def func(role: str):
        match role:
            case "manager":
                return manager_request
            case "editor":
                return editor_request
            case "anonymous":
                return anon_request
            case _:
                raise ValueError("role must be 'manager', 'editor', or 'anonymous'")

    return func


@pytest.fixture
def dummy_type_schema(role_request):
    def func(type_request: str = "manager"):
        request = role_request(type_request)
        url = "/@types/DummyType"
        response = request.get(url)
        data = response.json()
        return data

    return func


@pytest.fixture
def create_dummy_content(manager_request):
    def func(payload: dict):
        payload["@type"] = "DummyType"
        response = manager_request.post("/", json=payload)
        return response

    return func


@pytest.fixture
def themed_portal(functional_portal, portal_factory):
    """A portal with a themed DummyType and one extra theme in the registry.

    The type is a Container so a section can hold pages: the behavior is meant
    to be usable on any content type, not just the site root, which is what
    makes a per-section theme override possible.

    The theme is registered before the content, so the ``theme`` field has a
    vocabulary term to validate ``corporate`` against.
    """
    themes.create_theme(
        "corporate",
        {"name": "Corporate", "primary_color_light": "#123456"},
    )
    return portal_factory(
        behavior=f"{PACKAGE_NAME}.themeselector",
        payload={"id": "dummy-content-001", "theme": "corporate"},
        container=True,
    )


@pytest.fixture
def theme_registry(themed_portal) -> IRegistry:
    """The registry of the themed portal."""
    return getUtility(IRegistry)


@pytest.fixture(scope="module")
def checker():
    def func(value: Any, oper: str, expected: Any):
        match oper:
            case "in":
                assert expected in value, f"{expected} not found in {value}"
            case "not in":
                assert expected not in value, f"{expected} found in {value}"
            case "eq":
                assert expected == value, f"{expected} != {value}"
            case "ne":
                assert expected != value, f"{expected} == {value}"
            case "is":
                assert value is expected, f"{value} is not {expected}"
            case "is not":
                assert value is not expected, f"{value} is {expected}"
            case "starts":
                assert value.startswith(expected), (
                    f"{value} does not start with {expected}"
                )
            case _:
                raise ValueError(f"Unknown operation: {oper}")

    return func


@pytest.fixture
def registry_checker(checker):
    """Fixture to check registry settings."""

    def func(record: str, oper: str, expected: Any):
        """Check registry settings."""
        value = api.portal.get_registry_record(record, default=None)
        return checker(value, oper, expected)

    return func

from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from plone.dexterity.fti import DexterityFTI
from zope.component.hooks import setSite

import pytest
import transaction


@pytest.fixture(scope="session")
def editor_credentials() -> tuple[str, str]:
    """Return the credentials for the editor user."""
    return ("editor", "nomoresecrets")


@pytest.fixture
def portal_factory(functional_portal, editor_credentials):
    def func(behavior: str, payload: dict):
        setRoles(functional_portal, TEST_USER_ID, ["Manager"])
        fti = DexterityFTI("DummyType")
        fti.behaviors = (behavior,)
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

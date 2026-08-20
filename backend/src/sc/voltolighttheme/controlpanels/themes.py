from plone.protect.interfaces import IDisableCSRFProtection
from plone.restapi.controlpanels import RegistryConfigletPanel
from plone.restapi.deserializer import json_body
from plone.restapi.exceptions import DeserializationError
from sc.voltolighttheme.interfaces import ISCVLTThemeDefinition
from sc.voltolighttheme.interfaces import ISCVLTThemesControlpanel
from sc.voltolighttheme.utils import themes
from zExceptions import BadRequest
from zope.component import adapter
from zope.interface import alsoProvides
from zope.interface import implementer
from zope.interface import Interface
from zope.publisher.interfaces import NotFound


SERVICE_ID = "@controlpanels"
PANEL_NAME = "themes"


@adapter(Interface, Interface)
@implementer(ISCVLTThemesControlpanel)
class ThemesControlpanel(RegistryConfigletPanel):
    """Manage the named themes stored in ``plone.registry``.

    Unlike a regular registry control panel this one is a *collection*: it does
    not edit a single set of records but lists, creates, updates and deletes
    one set per theme. ``plone.restapi`` already traverses sub-paths of a panel
    into :meth:`add` / :meth:`get` / :meth:`update` / :meth:`delete`
    (see ``plone.restapi.services.controlpanels``), so no dedicated service is
    needed:

    ==========================================  ===========================
    Request                                     Method
    ==========================================  ===========================
    ``GET /@controlpanels/themes``              listing (via the serializer)
    ``GET /@controlpanels/themes/<id>``         :meth:`get`
    ``POST /@controlpanels/themes``             :meth:`add`
    ``PATCH /@controlpanels/themes/<id>``       :meth:`update`
    ``DELETE /@controlpanels/themes/<id>``      :meth:`delete`
    ==========================================  ===========================
    """

    schema = ISCVLTThemeDefinition
    configlet_id = "sc.voltolighttheme.themes"
    configlet_category_id = "Products"
    schema_prefix = themes.PREFIX

    #: Set by the serializer and the services; the panel is reached by name.
    __name__ = PANEL_NAME

    title = "Themes"
    group = "Products"

    def theme_url(self, theme_id: str) -> str:
        """Canonical URL of one theme.

        :param theme_id: the theme id.
        :returns: the absolute URL of the theme resource.
        """
        return f"{self.context.absolute_url()}/{SERVICE_ID}/{self.__name__}/{theme_id}"

    def serialize(self, theme_id: str) -> dict:
        """Represent one theme as returned by the API.

        :param theme_id: the theme id.
        :returns: the theme values plus ``@id`` and ``id``.
        """
        return {
            "@id": self.theme_url(theme_id),
            "id": theme_id,
            **themes.theme_values(theme_id),
        }

    def listing(self) -> list[dict]:
        """Every theme, in id order.

        :returns: one serialised theme per entry.
        """
        return [self.serialize(theme_id) for theme_id in themes.theme_ids()]

    def _body(self) -> dict:
        """Read the JSON body of the current request.

        :returns: the decoded body, empty when there is none.
        :raises BadRequest: when the body is not a JSON object.
        """
        try:
            return json_body(self.request)
        except DeserializationError as exc:
            raise BadRequest(str(exc)) from exc

    def _disable_csrf(self):
        """Allow the registry writes below.

        ``plone.protect`` treats writing to ``plone.registry`` as a change
        needing a CSRF token, which an API client does not carry; the REST API
        authenticates the request by other means.
        """
        alsoProvides(self.request, IDisableCSRFProtection)

    def _single(self, names):
        """Extract exactly one theme id from a traversal path.

        :param names: the traversed sub-path.
        :returns: the theme id.
        :raises NotFound: when the path does not name exactly one theme.
        """
        if len(names) != 1:
            raise NotFound(self.context, "/".join(names), self.request)
        return names[0]

    def add(self, names):
        """Create a theme from the request body.

        The body must carry an ``id``; every other key is treated as a field
        value. Responds ``201`` with a ``Location`` header, both derived by the
        service from the returned ``@id``.

        :param names: traversal path, which must be empty.
        :returns: the serialised theme.
        :raises BadRequest: on a missing, malformed or duplicate id.
        """
        if names:
            raise NotFound(self.context, "/".join(names), self.request)

        body = dict(self._body())
        theme_id = body.pop("id", None) or body.pop("@id", None)
        if not theme_id:
            raise BadRequest("Missing required field: id")
        if not themes.is_valid_theme_id(theme_id):
            raise BadRequest(
                f"Invalid theme id {theme_id!r}: use lowercase letters, "
                "digits and dashes, and no dots."
            )
        if themes.theme_exists(theme_id):
            raise BadRequest(f"Theme already exists: {theme_id}")

        self._disable_csrf()
        try:
            themes.create_theme(theme_id, body)
        except ValueError as exc:
            raise BadRequest(str(exc)) from exc
        return self.serialize(theme_id)

    def get(self, names):
        """Read one theme.

        :param names: traversal path naming exactly one theme.
        :returns: the serialised theme.
        :raises NotFound: when the theme does not exist.
        """
        theme_id = self._single(names)
        if not themes.theme_exists(theme_id):
            raise NotFound(self.context, theme_id, self.request)
        return self.serialize(theme_id)

    def update(self, names):
        """Partially update one theme from the request body.

        :param names: traversal path naming exactly one theme.
        :returns: the serialised theme.
        :raises NotFound: when the theme does not exist.
        """
        theme_id = self._single(names)
        if not themes.theme_exists(theme_id):
            raise NotFound(self.context, theme_id, self.request)

        body = dict(self._body())
        body.pop("id", None)
        body.pop("@id", None)

        self._disable_csrf()
        themes.update_theme(theme_id, body)
        return self.serialize(theme_id)

    def delete(self, names):
        """Delete one theme.

        The default theme is protected and may never be removed. Deleting a
        theme still selected by content is *allowed* — ``theme`` is not
        catalogued, so the reference cannot be checked cheaply; the field
        serializer degrades gracefully instead.

        :param names: traversal path naming exactly one theme.
        :raises NotFound: when the theme does not exist.
        :raises BadRequest: when asked to delete the default theme.
        """
        theme_id = self._single(names)
        if not themes.theme_exists(theme_id):
            raise NotFound(self.context, theme_id, self.request)

        self._disable_csrf()
        try:
            themes.delete_theme(theme_id)
        except ValueError as exc:
            raise BadRequest(str(exc)) from exc

    def get_searchable_text(self):
        """Panel title, group and every theme name.

        :returns: the searchable strings.
        """
        text_parts = [self.title, self.group]
        text_parts += [themes.theme_title(tid) for tid in themes.theme_ids()]
        return [text for text in text_parts if text]

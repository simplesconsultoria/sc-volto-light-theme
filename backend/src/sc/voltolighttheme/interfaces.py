"""Module where all interfaces, events and exceptions live."""

from plone import schema
from plone.restapi.controlpanels import IControlpanel
from sc.voltolighttheme import _
from sc.voltolighttheme import fields
from zope.interface import Interface
from zope.publisher.interfaces.browser import IDefaultBrowserLayer


class IBrowserLayer(IDefaultBrowserLayer):
    """Marker interface that defines a browser layer."""


class ISCVLTThemesControlpanel(IControlpanel):
    """Control panel managing the named themes."""


class ISCVLTThemeDefinition(Interface):
    """A Volto Light Theme definition."""

    name = schema.TextLine(
        title="Theme name",
        description="The name of the theme.",
        required=True,
    )

    description = schema.TextLine(
        title="Theme description",
        description="The description of the theme.",
        required=False,
    )

    primary_color = fields.Color(
        title=_("label_primary_color", default="Primary Color"),
        required=False,
    )

    primary_foreground_color = fields.Color(
        title=_(
            "label_primary_foreground_color",
            default="Primary Font Color",
        ),
        required=False,
    )

    header_foreground_color = fields.Color(
        title=_(
            "label_header_foreground_color",
            default="Navigation Text Color",
        ),
        required=False,
    )

    secondary_color = fields.Color(
        title=_("label_secondary_color", default="Secondary Background Color"),
        required=False,
    )

    secondary_foreground_color = fields.Color(
        title=_(
            "label_secondary_foreground_color",
            default="Secondary Font Color",
        ),
        required=False,
    )

    accent_color = fields.Color(
        title=_("label_accent_color", default="Accent Background Color"),
        required=False,
    )

    accent_foreground_color = fields.Color(
        title=_(
            "label_accent_foreground_color",
            default="Accent Font Color",
        ),
        required=False,
    )

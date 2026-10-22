"""Module where all interfaces, events and exceptions live."""

from plone import schema
from plone.restapi.controlpanels import IControlpanel
from plone.schema import JSONField
from plone.supermodel import model
from sc.voltolighttheme import _
from zope.publisher.interfaces.browser import IDefaultBrowserLayer


class IBrowserLayer(IDefaultBrowserLayer):
    """Marker interface that defines a browser layer."""


class ISCVLTThemesControlpanel(IControlpanel):
    """Control panel managing the named themes."""


class ISCVLTThemeDefinition(model.Schema):
    """A Volto Light Theme definition based entirely on ColorGroups and BlockThemes."""

    model.fieldset(
        "colorgroups",
        label=_("Color Groups"),
        fields=["color_groups"],
    )
    model.fieldset(
        "blockthemes",
        label=_("Block Themes"),
        fields=["block_themes"],
    )

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

    color_groups = JSONField(
        title=_("Color Groups"),
        description=_(
            "Mapping of color groups configured for this theme. Each color group defines "
            "a font and 4 colors (background, text, subtext, accent) with dark mode variations."
        ),
        required=False,
    )

    block_themes = JSONField(
        title=_("Block Themes"),
        description=_(
            "Mapping of block themes defining front and back color groups for blocks."
        ),
        required=False,
    )

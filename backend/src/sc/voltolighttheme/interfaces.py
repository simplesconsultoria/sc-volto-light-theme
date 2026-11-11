"""Module where all interfaces, events and exceptions live."""

from plone import schema
from plone.restapi.controlpanels import IControlpanel
from plone.schema import JSONField
from plone.supermodel import model
from sc.voltolighttheme import _
from sc.voltolighttheme.utils.legacy_themes import LEGACY_FIELDS
from zope.interface.interface import InterfaceClass
from zope.publisher.interfaces.browser import IDefaultBrowserLayer


class IBrowserLayer(IDefaultBrowserLayer):
    """Marker interface that defines a browser layer."""


class ISCVLTThemesControlpanel(IControlpanel):
    """Control panel managing the named themes."""


class ISCVLTThemeSchema(model.Schema):
    """A Volto Light Theme definition based entirely on ColorGroups and BlockThemes.

    This is the schema the Themes control panel serves and the one the code
    registers records for.
    """

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
            "Mapping of color groups configured for this theme. Each color group "
            "defines a font and 4 colors (background, text, subtext, accent) "
            "with dark mode variations."
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


#: The theme definition as GenericSetup profiles name it.
#:
#: ``ISCVLTThemeSchema`` plus the per-colour fields of 1.0.0a14 and earlier,
#: all optional. Profiles written for those versions (a ``registry.xml`` with
#: ``<records interface="sc.voltolighttheme.interfaces.ISCVLTThemeDefinition">``
#: and ``<value key="primary_color_light">``) keep importing on a new site:
#: without these fields the import raises ``ValueError: Cannot find a field for
#: the record``. Their values are folded into Color Groups when the theme is
#: read (see :mod:`sc.voltolighttheme.utils.legacy_themes`); they never reach
#: the control panel form.
ISCVLTThemeDefinition = InterfaceClass(
    "ISCVLTThemeDefinition",
    (ISCVLTThemeSchema,),
    {name: schema.TextLine(title=name, required=False) for name in LEGACY_FIELDS},
    __doc__="Theme definition, accepting the fields of earlier versions.",
    __module__=__name__,
)

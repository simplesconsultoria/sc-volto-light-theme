from plone.autoform import directives
from plone.autoform.interfaces import IFormFieldProvider
from plone.namedfile.field import NamedBlobImage
from plone.schema import JSONField
from plone.supermodel import model
from sc.voltolighttheme import _
from sc.voltolighttheme.behaviors.base import OBJECT_LIST
from sc.voltolighttheme.behaviors.base import OBJECT_LIST_DEFAULT_VALUE
from zope.interface import provider
from zope.schema import Bool
from zope.schema import TextLine


@provider(IFormFieldProvider)
class ISiteHeaderSettings(model.Schema):
    """Site/Subsite Header properties behavior."""

    model.fieldset(
        "header",
        label=_("Header settings"),
        fields=[
            "logo",
            "has_fat_menu",
            "header_actions",
        ],
    )

    logo = NamedBlobImage(
        title=_("label_site_logo", default="Site Logo"),
        description=_(
            "help_site_logo",
            default="If the site or subsite has a logo, please upload it here.",
        ),
        required=False,
    )

    has_fat_menu = Bool(
        title=_("label_enable_fat_menu", default="Enable Fat Menu"),
        description=_(
            "help_enable_fat_menu",
            default="If enabled, the fat menu will be shown.",
        ),
        required=False,
        default=True,
    )

    directives.widget(
        "header_actions",
        frontendOptions={
            "widget": "object_list",
            "widgetProps": {"schemaName": "headerActions"},
        },
    )
    header_actions = JSONField(
        title=_("Site Actions"),
        description=_(
            "help_header_actions",
            default="The site actions are the links that show in the top right side"
            " of the header.",
        ),
        schema=OBJECT_LIST,
        default=OBJECT_LIST_DEFAULT_VALUE,
        required=False,
        widget="",
    )
    directives.read_permission(
        has_fat_menu="sc.voltolighttheme.header_settings.view",
        header_actions="sc.voltolighttheme.header_settings.view",
        logo="sc.voltolighttheme.header_settings.view",
    )
    directives.write_permission(
        has_fat_menu="sc.voltolighttheme.header_settings.edit",
        header_actions="sc.voltolighttheme.header_settings.edit",
        logo="sc.voltolighttheme.header_settings.edit",
    )


@provider(IFormFieldProvider)
class IIntranetHeaderSettings(ISiteHeaderSettings):
    """Intranet Header properties behavior."""

    # Only the fields this schema adds may be listed here. plone.autoform
    # merges same-named fieldsets across the inheritance chain by *appending*
    # (``group.fields += new_fields`` in ``plone.autoform.utils``), and
    # ``z3c.form.field.Fields`` raises ``ValueError("Duplicate name", ...)`` on
    # a repeat. Re-listing the inherited fields here therefore breaks
    # ``@types/<type>`` with a 500 for every content type using this behavior.
    model.fieldset(
        "header",
        label=_("Header settings"),
        fields=[
            "complementary_logo",
            "has_intranet_header",
            "intranet_flag",
        ],
    )

    # Appending would put the new fields after the inherited ones; these
    # restore the intended order: logo, complementary_logo, has_fat_menu,
    # has_intranet_header, intranet_flag, header_actions.
    directives.order_after(complementary_logo="logo")
    directives.order_after(has_intranet_header="has_fat_menu")
    directives.order_after(intranet_flag="has_intranet_header")

    complementary_logo = NamedBlobImage(
        title=_("label_complementary_logo", default="Complementary Logo"),
        description=_(
            "help_complementary_logo",
            default="If your site has an intranet header,"
            " it will show in the right side of the header.",
        ),
        required=False,
    )

    has_intranet_header = Bool(
        title=_("label_has_intranet_header", default="Enable Intranet Header"),
        description=_(
            "help_has_intranet_header",
            default="If enabled, the intranet header will be shown.",
        ),
        required=False,
        default=True,
    )

    intranet_flag = TextLine(
        title=_("label_intranet_flag", default="Site Flag"),
        description=_(
            "help_intranet_flag",
            default="The colored pill at the top left of the header.",
        ),
        required=False,
    )

    directives.read_permission(
        complementary_logo="sc.voltolighttheme.header_settings.view",
        has_fat_menu="sc.voltolighttheme.header_settings.view",
        has_intranet_header="sc.voltolighttheme.header_settings.view",
        header_actions="sc.voltolighttheme.header_settings.view",
        intranet_flag="sc.voltolighttheme.header_settings.view",
        logo="sc.voltolighttheme.header_settings.view",
    )
    directives.write_permission(
        complementary_logo="sc.voltolighttheme.header_settings.edit",
        has_fat_menu="sc.voltolighttheme.header_settings.edit",
        has_intranet_header="sc.voltolighttheme.header_settings.edit",
        header_actions="sc.voltolighttheme.header_settings.edit",
        intranet_flag="sc.voltolighttheme.header_settings.edit",
        logo="sc.voltolighttheme.header_settings.edit",
    )

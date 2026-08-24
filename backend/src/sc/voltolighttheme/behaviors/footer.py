from plone.autoform import directives
from plone.autoform.interfaces import IFormFieldProvider
from plone.namedfile.field import NamedBlobImage
from plone.schema import JSONField
from plone.supermodel import model
from sc.voltolighttheme import _
from sc.voltolighttheme.behaviors.base import OBJECT_LIST
from sc.voltolighttheme.behaviors.base import OBJECT_LIST_DEFAULT_VALUE
from zope.interface import provider
from zope.schema import Text
from zope.schema import TextLine


@provider(IFormFieldProvider)
class IFooterSettings(model.Schema):
    """Site/Subsite footer properties behavior."""

    model.fieldset(
        "footer_brand",
        label=_("Footer: Brand"),
        fields=[
            "footer_logo",
            "footer_address",
            "footer_brand_slogan",
            "footer_brand_message",
        ],
    )

    model.fieldset(
        "footer_logos",
        label=_("Footer: Logos"),
        fields=[
            "footer_logos",
            "footer_logos_container_width",
            "footer_logos_size",
        ],
    )

    model.fieldset(
        "footer_columns_left",
        label=_("Footer: Left column"),
        fields=[
            "footer_column_left_header",
            "footer_column_left",
        ],
    )
    model.fieldset(
        "footer_columns_middle",
        label=_("Footer: Middle column"),
        fields=[
            "footer_column_middle_header",
            "footer_column_middle",
        ],
    )
    model.fieldset(
        "footer_columns_right",
        label=_("Footer: Right column"),
        fields=[
            "footer_column_right_header",
            "footer_column_right",
        ],
    )

    model.fieldset(
        "footer_settings",
        label=_("Footer: Settings"),
        fields=[
            "footer_links",
            "footer_colophon_text",
        ],
    )

    directives.widget(
        "footer_logos",
        frontendOptions={
            "widget": "object_list",
            "widgetProps": {"schemaName": "footerLogos"},
        },
    )
    footer_logos = JSONField(
        title=_("Footer logos"),
        schema=OBJECT_LIST,
        default=OBJECT_LIST_DEFAULT_VALUE,
        required=False,
        widget="",
    )

    directives.widget(
        "footer_logos_container_width",
        frontendOptions={
            "widget": "blockWidth",
            "widgetProps": {
                "filterActions": ["default", "layout"],
                "actions": [
                    {
                        "name": "default",
                        "label": "Default",
                    },
                    {
                        "name": "layout",
                        "label": "Layout",
                    },
                ],
            },
        },
    )
    footer_logos_container_width = TextLine(
        title=_("Footer logos container width"),
        default="default",
        required=False,
    )

    directives.widget(
        "footer_logos_size",
        frontendOptions={
            "widget": "size",
            "widgetProps": {"filterActions": ["s", "l"]},
        },
    )
    footer_logos_size = TextLine(
        title=_("Footer logos size"),
        default="s",
        required=False,
    )

    directives.widget(
        "footer_links",
        frontendOptions={
            "widget": "object_list",
            "widgetProps": {"schemaName": "footerLinks"},
        },
    )
    footer_links = JSONField(
        title=_("Footer links"),
        schema=OBJECT_LIST,
        default=OBJECT_LIST_DEFAULT_VALUE,
        required=False,
        widget="",
    )
    directives.widget(
        "footer_colophon_text",
        frontendOptions={
            "widget": "slate_richtext",
        },
    )

    footer_colophon_text = JSONField(
        title=_("Footer colophon text"),
        description=_(
            "help_footer_colophon_text",
            default="The text that shows in the footer colophon.",
        ),
        schema=OBJECT_LIST,
        default=[
            {
                "children": [
                    {
                        "text": "Powered by Plone and Volto Light Theme\n"
                        "The Plone® Open Source CMS/WCM is © 2000-2026 by the "
                    },
                    {
                        "children": [{"text": "Plone Foundation"}],
                        "data": {"url": "http://plone.org"},
                        "type": "link",
                    },
                    {"text": " and friends.\nDistributed under the "},
                    {
                        "children": [{"text": "GNU GPL v2 license"}],
                        "data": {
                            "url": "https://www.gnu.org/licenses/old-licenses/lgpl-2.0.html"
                        },
                        "type": "link",
                    },
                    {"text": "."},
                ],
                "type": "p",
            }
        ],
        required=False,
    )

    footer_brand_slogan = TextLine(
        title=_("Brand slogan"),
        description=_(
            "The brand slogan that appears below the footer logo in the"
            " first footer column."
        ),
        required=False,
    )

    footer_brand_message = Text(
        title=_("Brand message"),
        description=_(
            "The footer brand message that appears below the footer slogan in the"
            " first footer column."
        ),
        required=False,
    )

    footer_logo = NamedBlobImage(
        title=_("label_footer_logo", default="Footer Logo"),
        description=_(
            "help_footer_logo",
            default="The footer has a main logo located in the lower"
            " left side, above the address. In case that the footer has a dark "
            " background, you can set this inversed logo to ensure it plays well with "
            "the background color. If not set, the main site logo will be used.",
        ),
        required=False,
    )

    footer_address = Text(
        title=_("Footer address"),
        description=_(
            "The footer address that appears below the footer logo in the"
            " first footer column."
        ),
        required=False,
    )

    footer_column_left_header = TextLine(
        title=_("Footer column left header"),
        required=False,
    )

    directives.widget(
        "footer_column_left",
        frontendOptions={
            "widget": "object_list",
            "widgetProps": {"schemaName": "footerLinks"},
        },
    )
    footer_column_left = JSONField(
        title=_("Footer column left"),
        description=_(
            "The left-most column appearing after the address column. It can contain"
            " a list of links."
        ),
        schema=OBJECT_LIST,
        default=OBJECT_LIST_DEFAULT_VALUE,
        required=False,
        widget="",
    )

    footer_column_middle_header = TextLine(
        title=_("Footer column middle header"),
        required=False,
    )

    directives.widget(
        "footer_column_middle",
        frontendOptions={
            "widget": "object_list",
            "widgetProps": {"schemaName": "footerLinks"},
        },
    )
    footer_column_middle = JSONField(
        title=_("Footer column middle"),
        description=_(
            "The middle column appearing between the left and the right columns. It can"
            " contain a list of links."
        ),
        schema=OBJECT_LIST,
        default=OBJECT_LIST_DEFAULT_VALUE,
        required=False,
        widget="",
    )

    footer_column_right_header = TextLine(
        title=_("Footer column right header"),
        required=False,
    )

    directives.widget(
        "footer_column_right",
        frontendOptions={
            "widget": "object_list",
            "widgetProps": {"schemaName": "footerLinks"},
        },
    )
    footer_column_right = JSONField(
        title=_("Footer column right"),
        description=_(
            "The right-most column appearing after the middle column. It can contain"
            " a list of links."
        ),
        schema=OBJECT_LIST,
        default=OBJECT_LIST_DEFAULT_VALUE,
        required=False,
        widget="",
    )
    directives.read_permission(
        footer_address="sc.voltolighttheme.footer_settings.view",
        footer_brand_message="sc.voltolighttheme.footer_settings.view",
        footer_brand_slogan="sc.voltolighttheme.footer_settings.view",
        footer_colophon_text="sc.voltolighttheme.footer_settings.view",
        footer_column_left_header="sc.voltolighttheme.footer_settings.view",
        footer_column_left="sc.voltolighttheme.footer_settings.view",
        footer_column_middle_header="sc.voltolighttheme.footer_settings.view",
        footer_column_middle="sc.voltolighttheme.footer_settings.view",
        footer_column_right_header="sc.voltolighttheme.footer_settings.view",
        footer_column_right="sc.voltolighttheme.footer_settings.view",
        footer_links="sc.voltolighttheme.footer_settings.view",
        footer_logo="sc.voltolighttheme.footer_settings.view",
        footer_logos_container_width="sc.voltolighttheme.footer_settings.view",
        footer_logos_size="sc.voltolighttheme.footer_settings.view",
        footer_logos="sc.voltolighttheme.footer_settings.view",
    )
    directives.write_permission(
        footer_address="sc.voltolighttheme.footer_settings.edit",
        footer_brand_message="sc.voltolighttheme.footer_settings.edit",
        footer_brand_slogan="sc.voltolighttheme.footer_settings.edit",
        footer_colophon_text="sc.voltolighttheme.footer_settings.edit",
        footer_column_left_header="sc.voltolighttheme.footer_settings.edit",
        footer_column_left="sc.voltolighttheme.footer_settings.edit",
        footer_column_middle_header="sc.voltolighttheme.footer_settings.edit",
        footer_column_middle="sc.voltolighttheme.footer_settings.edit",
        footer_column_right_header="sc.voltolighttheme.footer_settings.edit",
        footer_column_right="sc.voltolighttheme.footer_settings.edit",
        footer_links="sc.voltolighttheme.footer_settings.edit",
        footer_logo="sc.voltolighttheme.footer_settings.edit",
        footer_logos_container_width="sc.voltolighttheme.footer_settings.edit",
        footer_logos_size="sc.voltolighttheme.footer_settings.edit",
        footer_logos="sc.voltolighttheme.footer_settings.edit",
    )

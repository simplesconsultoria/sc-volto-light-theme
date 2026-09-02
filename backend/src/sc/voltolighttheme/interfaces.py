"""Module where all interfaces, events and exceptions live."""

from plone import schema
from plone.restapi.controlpanels import IControlpanel
from plone.supermodel import model
from sc.voltolighttheme import _
from sc.voltolighttheme import fields
from zope.publisher.interfaces.browser import IDefaultBrowserLayer


class IBrowserLayer(IDefaultBrowserLayer):
    """Marker interface that defines a browser layer."""


class ISCVLTThemesControlpanel(IControlpanel):
    """Control panel managing the named themes."""


class ISCVLTThemeDefinition(model.Schema):
    """A Volto Light Theme definition."""

    model.fieldset(
        "typography",
        label=_("Typography"),
        fields=["font_family_primary", "font_family_secondary"],
    )

    model.fieldset(
        "primary",
        label=_("Primary Colors"),
        fields=[
            "primary_color_light",
            "primary_color_dark",
            "primary_foreground_color_light",
            "primary_foreground_color_dark",
            "primary_low_foreground_color_light",
            "primary_low_foreground_color_dark",
            "primary_accent_color_light",
            "primary_accent_color_dark",
        ],
    )

    model.fieldset(
        "secondary",
        label=_("Secondary Colors"),
        fields=[
            "secondary_color_light",
            "secondary_color_dark",
            "secondary_foreground_color_light",
            "secondary_foreground_color_dark",
            "secondary_low_foreground_color_light",
            "secondary_low_foreground_color_dark",
            "secondary_accent_color_light",
            "secondary_accent_color_dark",
        ],
    )

    model.fieldset(
        "accent",
        label=_("Accent Colors"),
        fields=[
            "accent_color_light",
            "accent_color_dark",
            "accent_foreground_color_light",
            "accent_foreground_color_dark",
            "accent_low_foreground_color_light",
            "accent_low_foreground_color_dark",
            "accent_accent_color_light",
            "accent_accent_color_dark",
        ],
    )

    model.fieldset(
        "neutral",
        label=_("Neutral Colors"),
        fields=[
            "neutral_color_light",
            "neutral_color_dark",
            "neutral_foreground_color_light",
            "neutral_foreground_color_dark",
            "neutral_low_foreground_color_light",
            "neutral_low_foreground_color_dark",
            "neutral_accent_color_light",
            "neutral_accent_color_dark",
        ],
    )
    model.fieldset(
        "content_types",
        label=_("Content Types Colors"),
        fields=[
            "event_color_light",
            "event_color_dark",
            "file_color_light",
            "file_color_dark",
            "image_color_light",
            "image_color_dark",
        ],
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

    font_family_primary = schema.Choice(
        title=_("label_font_family_primary", default="Primary Font Family"),
        values=[
            "Inter, sans-serif",
            "system-ui, sans-serif",
            "Roboto, sans-serif",
            "Outfit, sans-serif",
        ],
        required=False,
    )

    font_family_secondary = schema.Choice(
        title=_("label_font_family_secondary", default="Secondary Font Family"),
        values=[
            "Inter, sans-serif",
            "system-ui, sans-serif",
            "Roboto, sans-serif",
            "Outfit, sans-serif",
        ],
        required=False,
    )

    primary_color_light = fields.Color(
        title=_(
            "label_primary_color_light", default="Primary Background Color (Light)"
        ),
        required=False,
    )
    primary_color_dark = fields.Color(
        title=_("label_primary_color_dark", default="Primary Background Color (Dark)"),
        required=False,
    )
    primary_foreground_color_light = fields.Color(
        title=_(
            "label_primary_foreground_color_light",
            default="Primary Foreground Color (Light)",
        ),
        required=False,
    )
    primary_foreground_color_dark = fields.Color(
        title=_(
            "label_primary_foreground_color_dark",
            default="Primary Foreground Color (Dark)",
        ),
        required=False,
    )
    primary_low_foreground_color_light = fields.Color(
        title=_(
            "label_primary_low_foreground_color_light",
            default="Primary Low Foreground Color (Light)",
        ),
        required=False,
    )
    primary_low_foreground_color_dark = fields.Color(
        title=_(
            "label_primary_low_foreground_color_dark",
            default="Primary Low Foreground Color (Dark)",
        ),
        required=False,
    )
    primary_accent_color_light = fields.Color(
        title=_(
            "label_primary_accent_color_light", default="Primary Accent Color (Light)"
        ),
        required=False,
    )
    primary_accent_color_dark = fields.Color(
        title=_(
            "label_primary_accent_color_dark", default="Primary Accent Color (Dark)"
        ),
        required=False,
    )
    secondary_color_light = fields.Color(
        title=_(
            "label_secondary_color_light", default="Secondary Background Color (Light)"
        ),
        required=False,
    )
    secondary_color_dark = fields.Color(
        title=_(
            "label_secondary_color_dark", default="Secondary Background Color (Dark)"
        ),
        required=False,
    )
    secondary_foreground_color_light = fields.Color(
        title=_(
            "label_secondary_foreground_color_light",
            default="Secondary Foreground Color (Light)",
        ),
        required=False,
    )
    secondary_foreground_color_dark = fields.Color(
        title=_(
            "label_secondary_foreground_color_dark",
            default="Secondary Foreground Color (Dark)",
        ),
        required=False,
    )
    secondary_low_foreground_color_light = fields.Color(
        title=_(
            "label_secondary_low_foreground_color_light",
            default="Secondary Low Foreground Color (Light)",
        ),
        required=False,
    )
    secondary_low_foreground_color_dark = fields.Color(
        title=_(
            "label_secondary_low_foreground_color_dark",
            default="Secondary Low Foreground Color (Dark)",
        ),
        required=False,
    )
    secondary_accent_color_light = fields.Color(
        title=_(
            "label_secondary_accent_color_light",
            default="Secondary Accent Color (Light)",
        ),
        required=False,
    )
    secondary_accent_color_dark = fields.Color(
        title=_(
            "label_secondary_accent_color_dark", default="Secondary Accent Color (Dark)"
        ),
        required=False,
    )
    accent_color_light = fields.Color(
        title=_("label_accent_color_light", default="Accent Background Color (Light)"),
        required=False,
    )
    accent_color_dark = fields.Color(
        title=_("label_accent_color_dark", default="Accent Background Color (Dark)"),
        required=False,
    )
    accent_foreground_color_light = fields.Color(
        title=_(
            "label_accent_foreground_color_light",
            default="Accent Foreground Color (Light)",
        ),
        required=False,
    )
    accent_foreground_color_dark = fields.Color(
        title=_(
            "label_accent_foreground_color_dark",
            default="Accent Foreground Color (Dark)",
        ),
        required=False,
    )
    accent_low_foreground_color_light = fields.Color(
        title=_(
            "label_accent_low_foreground_color_light",
            default="Accent Low Foreground Color (Light)",
        ),
        required=False,
    )
    accent_low_foreground_color_dark = fields.Color(
        title=_(
            "label_accent_low_foreground_color_dark",
            default="Accent Low Foreground Color (Dark)",
        ),
        required=False,
    )
    accent_accent_color_light = fields.Color(
        title=_(
            "label_accent_accent_color_light", default="Accent Accent Color (Light)"
        ),
        required=False,
    )
    accent_accent_color_dark = fields.Color(
        title=_("label_accent_accent_color_dark", default="Accent Accent Color (Dark)"),
        required=False,
    )
    neutral_color_light = fields.Color(
        title=_(
            "label_neutral_color_light", default="Neutral Background Color (Light)"
        ),
        required=False,
    )
    neutral_color_dark = fields.Color(
        title=_("label_neutral_color_dark", default="Neutral Background Color (Dark)"),
        required=False,
    )
    neutral_foreground_color_light = fields.Color(
        title=_(
            "label_neutral_foreground_color_light",
            default="Neutral Foreground Color (Light)",
        ),
        required=False,
    )
    neutral_foreground_color_dark = fields.Color(
        title=_(
            "label_neutral_foreground_color_dark",
            default="Neutral Foreground Color (Dark)",
        ),
        required=False,
    )
    neutral_low_foreground_color_light = fields.Color(
        title=_(
            "label_neutral_low_foreground_color_light",
            default="Neutral Low Foreground Color (Light)",
        ),
        required=False,
    )
    neutral_low_foreground_color_dark = fields.Color(
        title=_(
            "label_neutral_low_foreground_color_dark",
            default="Neutral Low Foreground Color (Dark)",
        ),
        required=False,
    )
    neutral_accent_color_light = fields.Color(
        title=_(
            "label_neutral_accent_color_light", default="Neutral Accent Color (Light)"
        ),
        required=False,
    )
    neutral_accent_color_dark = fields.Color(
        title=_(
            "label_neutral_accent_color_dark", default="Neutral Accent Color (Dark)"
        ),
        required=False,
    )
    event_color_light = fields.Color(
        title=_("label_event_color_light", default="Event Color (Light)"),
        required=False,
    )
    event_color_dark = fields.Color(
        title=_("label_event_color_dark", default="Event Color (Dark)"),
        required=False,
    )
    file_color_light = fields.Color(
        title=_("label_file_color_light", default="File Color (Light)"),
        required=False,
    )
    file_color_dark = fields.Color(
        title=_("label_file_color_dark", default="File Color (Dark)"),
        required=False,
    )
    image_color_light = fields.Color(
        title=_("label_image_color_light", default="Image Color (Light)"),
        required=False,
    )
    image_color_dark = fields.Color(
        title=_("label_image_color_dark", default="Image Color (Dark)"),
        required=False,
    )

from plone.autoform.interfaces import IFormFieldProvider
from plone.supermodel import model
from sc.voltolighttheme import _
from zope.interface import provider
from zope.schema import Text
from zope.schema import TextLine


@provider(IFormFieldProvider)
class ISCFooter(model.Schema):
    """Site/Subsite footer properties behavior."""

    model.fieldset(
        "footer",
        label=_("Footer customizations"),
        fields=[
            "footer_brand_slogan",
            "footer_brand_message",
        ],
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

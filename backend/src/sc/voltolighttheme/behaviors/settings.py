from kitconcept.voltolighttheme.behaviors import customizations as vlt
from kitconcept.voltolighttheme.behaviors import footer as footer
from plone.autoform.interfaces import OMITTED_KEY
from plone.supermodel.interfaces import ISchema
from plone.supermodel.interfaces import ISchemaPlugin
from zope.component import adapter
from zope.interface import implementer
from zope.interface import Interface


#: Foreign behavior schema -> field names we want to hide on every form.
FIELDS_TO_OMIT = {
    vlt.ISiteHeaderCustomizationSettings: (
        "has_intranet_header",
        "intranet_flag",
        "header_actions",
        "complementary_logo",
    ),
    vlt.ISiteThemeCustomizationSettings: (
        "header_foreground",
        "accent_foreground_color",
        "accent_color",
        "secondary_foreground_color",
        "secondary_color",
    ),
    footer.IKitconceptVoltoFooterSettings: (
        "post_footer_logo",
        "post_footer_logo_link",
    ),
}


@adapter(ISchema)
@implementer(ISchemaPlugin)
class SchemaCleanupPlugin:
    """Hide fields declared by third-party (Volto Light Theme) behaviors.

    Registered as an :class:`~plone.supermodel.interfaces.ISchemaPlugin`, this
    runs for every supermodel schema during ``finalizeSchemas`` -- the
    ``z3c.zcmlhook`` action that fires once *after* all ZCML (including this
    adapter) is loaded. For each foreign schema listed in
    :data:`FIELDS_TO_OMIT` it appends ``plone.autoform`` omit directives.

    :ivar schema: the schema being finalized, passed by the plugin machinery.
    """

    #: Run after the stock supermodel plugins.
    order = 1000

    def __init__(self, schema):
        self.schema = schema

    def __call__(self) -> None:
        """Append omit directives for the configured fields, if any.

        ``plone.autoform`` stores omit directives as a list of
        ``(form_interface, field_name, "true"/"false")`` tuples;
        :data:`~zope.interface.Interface` as the form interface means "omit on
        every form". We merge with whatever the schema already declares instead
        of overwriting it, and stay idempotent across repeated finalizations.
        """
        fields = FIELDS_TO_OMIT.get(self.schema)
        if not fields:
            return
        omitted = list(self.schema.queryTaggedValue(OMITTED_KEY, []))
        already = {(iface, name) for iface, name, _ in omitted}
        for name in fields:
            if (Interface, name) not in already:
                omitted.append((Interface, name, "true"))
        self.schema.setTaggedValue(OMITTED_KEY, omitted)

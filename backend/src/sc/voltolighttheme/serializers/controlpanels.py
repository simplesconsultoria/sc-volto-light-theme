from plone.restapi.interfaces import ISerializeToJson
from plone.restapi.serializer.controlpanels import get_jsonschema_for_controlpanel
from sc.voltolighttheme.interfaces import ISCVLTThemesControlpanel
from zope.component import adapter
from zope.interface import implementer


@implementer(ISerializeToJson)
@adapter(ISCVLTThemesControlpanel)
class ThemesControlpanelSerializeToJson:
    """Serialize the themes control panel as a collection.

    ``plone.restapi``'s default panel serializer reads a *single* set of
    records through ``registry.forInterface(schema, prefix=...)``. Themes are
    many sets sharing one schema, one prefix segment apart, so that shape
    cannot express them; this adapter returns the schema once and the themes
    as ``items`` instead.

    The ``schema`` key is the same JSON schema the default serializer would
    emit, so the frontend can drive the existing form machinery — including the
    ``colorPicker`` widget contributed by
    :class:`~sc.voltolighttheme.serializers.fields.ColorJsonSchemaProvider`.
    """

    def __init__(self, controlpanel):
        self.controlpanel = controlpanel

    def __call__(self) -> dict:
        panel = self.controlpanel
        return {
            "@id": (f"{panel.context.absolute_url()}/@controlpanels/{panel.__name__}"),
            "title": panel.title,
            "group": panel.group,
            "schema": get_jsonschema_for_controlpanel(
                panel, panel.context, panel.request
            ),
            "items": panel.listing(),
            "items_total": len(panel.listing()),
        }

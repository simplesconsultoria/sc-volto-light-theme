from plone.dexterity.interfaces import IDexterityContent
from plone.restapi.interfaces import IFieldSerializer
from plone.restapi.serializer.dxfields import DefaultFieldSerializer
from plone.restapi.types.adapters import TextLineJsonSchemaProvider
from plone.restapi.types.interfaces import IJsonSchemaProvider
from sc.voltolighttheme.fields import IColor
from sc.voltolighttheme.fields import IThemeField
from sc.voltolighttheme.utils import themes
from zope.component import adapter
from zope.interface import implementer
from zope.interface import Interface


@adapter(IColor, Interface, Interface)
@implementer(IJsonSchemaProvider)
class ColorJsonSchemaProvider(TextLineJsonSchemaProvider):
    def get_widget(self):
        return "colorPicker"

    def get_factory(self):
        return "Color"


@adapter(IThemeField, IDexterityContent, Interface)
@implementer(IFieldSerializer)
class ThemeFieldSerializer(DefaultFieldSerializer):
    """Serialize the selected theme, resolved against the registry.

    The frontend reads these through ``@components.inherit``, which serializes
    behavior schemas field by field via ``IFieldSerializer`` — so specializing
    the *field* covers both the inherit expander and ordinary content
    serialization with one adapter.

    The ``token``/``title`` pair is **not decorative**: it is the contract every
    Volto choice widget relies on, and both ends of the round-trip need it.

    - Reading, ``normalizeSingleSelectOption`` resolves the selected option as
      ``value.token ?? value.value ?? value.UID ?? 'no-value'``. A payload
      without ``token`` therefore renders as *No value*, however complete it is.
    - Writing, ``plone.restapi``'s ``ChoiceFieldDeserializer`` unwraps
      ``value["token"]`` when it is handed a mapping, so an untouched field
      survives a ``PATCH`` of the whole form.

    The resolved settings live under ``value`` so they travel with the field
    without displacing that contract. Only style-bearing fields go there:
    ``name`` is already the ``title``, and the frontend turns every key of
    ``value`` into a CSS custom property.

    A theme deleted while still selected keeps its ``token`` and gets an empty
    ``value``: the reference is dangling, but the response must still be served
    — themes are not catalogued, so this is the only guard against it.
    """

    def __call__(self):
        theme_id = self.get_value()
        if not theme_id:
            return None
        return {
            "token": theme_id,
            "title": themes.theme_title(theme_id),
            "value": themes.theme_settings(theme_id),
        }

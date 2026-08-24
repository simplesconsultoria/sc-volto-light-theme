from plone.registry.field import PersistentField
from sc.voltolighttheme import _
from sc.voltolighttheme.utils.colors import is_valid_color
from zope.interface import implementer
from zope.schema import NativeStringLine
from zope.schema.interfaces import IFromUnicode
from zope.schema.interfaces import INativeStringLine
from zope.schema.interfaces import ValidationError


class IColor(INativeStringLine):
    """A field containing a hex color value."""


class InvalidColor(ValidationError):
    __doc__ = _("""This is not a valid color.""")


@implementer(IColor, IFromUnicode)
class Color(NativeStringLine):
    """Color picker schema field"""

    def _validate(self, value):
        super()._validate(value)
        if not value or is_valid_color(value):
            return

        raise InvalidColor(value)

    def fromUnicode(self, value):
        v = str(value.strip())
        self.validate(v)
        return v


class PersistentColor(PersistentField, Color):
    """A :class:`Color` that can be stored in ``plone.registry``.

    ``plone.registry`` resolves the persistent equivalent of a field by looking
    up its **class name** in :mod:`plone.registry.field`
    (see ``plone.registry.fieldfactory.persistentFieldAdapter``). ``Color`` has
    no entry there and neither does its ``NativeStringLine`` base, so without
    this class and the adapter registered alongside it,
    :meth:`plone.registry.registry.Registry.registerInterface` raises
    ``TypeError: There is no persistent field equivalent for the field
    ``<name>`` of type ``Color```.
    """

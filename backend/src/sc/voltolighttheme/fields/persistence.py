from plone.registry.field import DisallowedProperty
from plone.registry.field import StubbornProperty
from plone.registry.interfaces import IPersistentField
from sc.voltolighttheme.fields.color import IColor
from sc.voltolighttheme.fields.color import PersistentColor
from zope.component import adapter
from zope.interface import implementer


@implementer(IPersistentField)
@adapter(IColor)
def color_persistent_field_adapter(context):
    """Turn a :class:`~sc.voltolighttheme.fields.color.Color` into a persistent one.

    ``plone.registry`` ships a generic adapter registered on ``IField`` that
    resolves the persistent class by name from :mod:`plone.registry.field`; it
    returns ``None`` for our field, which makes ``registerInterface`` fail.
    This adapter is registered on the narrower ``IColor``, so it takes
    precedence.

    :param context: the field to convert.
    :returns: an equivalent :class:`PersistentColor`.
    """
    if IPersistentField.providedBy(context):
        return context

    # Properties that must not be copied onto a persistent field: `constraint`
    # would pin a symbol that may disappear, and `order` is meaningless once
    # stored. Mirrors what `plone.registry.fieldfactory` filters out.
    ignored = list(DisallowedProperty.uses + StubbornProperty.uses)

    instance = PersistentColor.__new__(PersistentColor)
    instance.__dict__.update({
        key: value for key, value in context.__dict__.items() if key not in ignored
    })
    return instance

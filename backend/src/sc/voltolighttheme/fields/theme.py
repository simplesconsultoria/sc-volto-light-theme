from zope.interface import implementer
from zope.schema import Choice
from zope.schema.interfaces import IChoice


class IThemeField(IChoice):
    """A choice among the themes registered in ``plone.registry``."""


@implementer(IThemeField)
class ThemeChoice(Choice):
    """Select a named theme.

    Stores the theme *id*, but serializes to the theme's resolved values so the
    frontend does not have to fetch them separately. See
    :class:`~sc.voltolighttheme.serializers.fields.ThemeFieldSerializer`.
    """

    def __init__(self, **kw):
        kw.setdefault("vocabulary", "sc.voltolighttheme.themes")
        super().__init__(**kw)

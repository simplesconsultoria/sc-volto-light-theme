from plone.autoform import directives
from plone.autoform.interfaces import IFormFieldProvider
from plone.supermodel import model
from sc.voltolighttheme import _
from sc.voltolighttheme.fields import ThemeChoice
from zope.interface import provider


@provider(IFormFieldProvider)
class IThemeSelector(model.Schema):
    """Select one of the named themes for a site or section.

    The behavior may be added to any content type, not just the site root: the
    ``@inherit`` expander resolves the closest object up the acquisition chain
    that provides it, so a section can override the theme of its parent.

    .. note::
       If this schema is ever subclassed, the child's ``model.fieldset`` must
       list **only** the fields it adds. ``plone.autoform`` merges same-named
       fieldsets by appending, and ``z3c.form`` rejects a repeated field name
       with ``ValueError("Duplicate name", ...)`` — which surfaces as a 500 on
       ``@types/<type>``, breaking the edit form.
    """

    model.fieldset(
        "theme",
        label=_("Theme"),
        fields=["theme"],
    )

    theme = ThemeChoice(
        title=_("label_theme", default="Theme"),
        description=_(
            "help_theme",
            default="The theme applied to this site or section.",
        ),
        required=False,
    )

    directives.read_permission(theme="sc.voltolighttheme.theme_settings.view")
    directives.write_permission(theme="sc.voltolighttheme.theme_settings.edit")

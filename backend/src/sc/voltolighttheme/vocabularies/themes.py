from sc.voltolighttheme.utils import themes
from zope.interface import implementer
from zope.schema.interfaces import IVocabularyFactory
from zope.schema.vocabulary import SimpleTerm
from zope.schema.vocabulary import SimpleVocabulary


@implementer(IVocabularyFactory)
class ThemesVocabulary:
    """Themes registered in ``plone.registry``.

    Token and value are the theme id; the title is the theme ``name``, falling
    back to the id so a half-configured theme never renders a blank option.
    """

    def __call__(self, context=None) -> SimpleVocabulary:
        terms = [
            SimpleTerm(
                value=theme_id,
                token=theme_id,
                title=themes.theme_title(theme_id),
            )
            for theme_id in themes.theme_ids()
        ]
        return SimpleVocabulary(terms)


ThemesVocabularyFactory = ThemesVocabulary()

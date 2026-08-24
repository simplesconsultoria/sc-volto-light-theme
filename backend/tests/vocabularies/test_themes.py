"""The `sc.voltolighttheme.themes` vocabulary."""

from plone.registry.interfaces import IRegistry
from sc.voltolighttheme.utils import themes
from zope.component import getUtility
from zope.schema.interfaces import IVocabularyFactory

import pytest


VOCABULARY = "sc.voltolighttheme.themes"


class TestThemesVocabulary:
    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.portal = integration["portal"]
        self.registry = getUtility(IRegistry)
        self.factory = getUtility(IVocabularyFactory, VOCABULARY)

    def test_vocabulary_is_registered(self):
        assert self.factory is not None

    def test_contains_the_default_theme(self):
        vocabulary = self.factory(self.portal)
        assert themes.DEFAULT_THEME_ID in [term.token for term in vocabulary]

    def test_token_and_value_are_the_theme_id(self):
        vocabulary = self.factory(self.portal)
        term = vocabulary.getTerm(themes.DEFAULT_THEME_ID)
        assert term.token == themes.DEFAULT_THEME_ID
        assert term.value == themes.DEFAULT_THEME_ID

    def test_title_is_the_theme_name(self):
        vocabulary = self.factory(self.portal)
        term = vocabulary.getTerm(themes.DEFAULT_THEME_ID)
        assert term.title == "Default"

    def test_a_new_theme_shows_up(self):
        themes.create_theme("corporate", {"name": "Corporate"}, registry=self.registry)
        vocabulary = self.factory(self.portal)
        assert vocabulary.getTerm("corporate").title == "Corporate"

    def test_title_falls_back_to_the_id(self):
        themes.create_theme("untitled", registry=self.registry)
        vocabulary = self.factory(self.portal)
        assert vocabulary.getTerm("untitled").title == "untitled"

    def test_a_deleted_theme_disappears(self):
        themes.create_theme("corporate", registry=self.registry)
        themes.delete_theme("corporate", registry=self.registry)
        vocabulary = self.factory(self.portal)
        assert "corporate" not in [term.token for term in vocabulary]

    def test_terms_are_sorted_by_id(self):
        themes.create_theme("alpha", registry=self.registry)
        themes.create_theme("zulu", registry=self.registry)
        tokens = [term.token for term in self.factory(self.portal)]
        assert tokens == sorted(tokens)

    def test_an_unknown_token_raises(self):
        vocabulary = self.factory(self.portal)
        with pytest.raises(LookupError):
            vocabulary.getTerm("not-here")

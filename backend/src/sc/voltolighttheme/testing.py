from plone.app.contenttypes.testing import PLONE_APP_CONTENTTYPES_FIXTURE
from plone.app.robotframework.testing import REMOTE_LIBRARY_BUNDLE_FIXTURE
from plone.app.testing import applyProfile
from plone.app.testing import FunctionalTesting
from plone.app.testing import IntegrationTesting
from plone.app.testing import PloneSandboxLayer
from plone.supermodel.model import finalizeSchemas
from plone.testing.zope import WSGI_SERVER_FIXTURE

import sc.voltolighttheme


class Layer(PloneSandboxLayer):
    defaultBases = (PLONE_APP_CONTENTTYPES_FIXTURE,)

    def setUpZope(self, app, configurationContext):
        # Load any other ZCML that is required for your tests.
        # The z3c.autoinclude feature is disabled in the Plone fixture base
        # layer.
        import plone.restapi

        self.loadZCML(package=plone.restapi)
        self.loadZCML(package=sc.voltolighttheme)
        # plone.supermodel finalizes schemas from a customAction in its own
        # configure.zcml, so at startup it runs last and sees every
        # ISchemaPlugin. This layer loads our ZCML in a later context, after
        # that action already fired, so SchemaCleanupPlugin would never run.
        # Re-finalize here to get the ordering a real startup has.
        finalizeSchemas()

    def setUpPloneSite(self, portal):
        applyProfile(portal, "sc.voltolighttheme:default")


FIXTURE = Layer()

INTEGRATION_TESTING = IntegrationTesting(
    bases=(FIXTURE,),
    name="Sc.VoltolightthemeLayer:IntegrationTesting",
)


FUNCTIONAL_TESTING = FunctionalTesting(
    bases=(FIXTURE, WSGI_SERVER_FIXTURE),
    name="Sc.VoltolightthemeLayer:FunctionalTesting",
)


ACCEPTANCE_TESTING = FunctionalTesting(
    bases=(
        FIXTURE,
        REMOTE_LIBRARY_BUNDLE_FIXTURE,
        WSGI_SERVER_FIXTURE,
    ),
    name="Sc.VoltolightthemeLayer:AcceptanceTesting",
)

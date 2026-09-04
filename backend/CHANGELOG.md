# Changelog

<!--
   You should *NOT* be adding new change log entries to this file.
   You should create a file in the news directory instead.
   For helpful instructions, please see:
   https://github.com/plone/plone.releaser/blob/master/ADD-A-NEWS-ITEM.rst
-->

<!-- towncrier release notes start -->

## 1.0.0a6 (2026-09-04)


### New features:

- Added `event_color`, `file_color` and `image_color` (with `_light` and `_dark` variants) to the `ISCVLTThemeDefinition` schema and updated `default` and `initial` registry profiles, allowing site themes to control content-type colors directly from the themes control panel. @humanaice 

## 1.0.0a5 (2026-08-24)


### New features:

- Added named themes: managers define them in a new Themes control panel and editors select one per site or section through the `sc.voltolighttheme.themeselector` behavior. Themes are stored in the registry as `ISCVLTThemeDefinition` records, exposed through the `sc.voltolighttheme.themes` vocabulary, and their settings are resolved when the field is serialized, so the closest theme up the acquisition chain applies. Also replaced the `kitconcept.voltolighttheme` header and footer behaviors with our own. @ericof [#20](https://github.com/simplesconsultoria/sc-volto-light-theme/issues/20)
- Added an `intranet` extension profile that enables the `sc.voltolighttheme.intranetheader` behavior on the site root in place of `sc.voltolighttheme.siteheader`. The profile is hidden from the add-ons control panel, so it is applied by a distribution rather than installed by hand. @ericof 


### Internal:

- Bumped the default profile to version 1001 and added the matching upgrade step, which reimports the registry, the Plone Site FTI and the control panel configuration, and uninstalls `kitconcept.voltolighttheme`. The dependency on `profile-kitconcept.voltolighttheme:default` was dropped, and its header, theme and footer behaviors are now unregistered through `z3c.unconfigure` when the package is present. @ericof [#20](https://github.com/simplesconsultoria/sc-volto-light-theme/issues/20)
- Moved the `natal` example theme out of the default profile and into the `initial` example-content profile, so a plain installation ships only the `default` theme. @ericof 


### Tests

- Consolidated the test fixtures into a single `tests/conftest.py`: `dummy_type_schema` and `create_dummy_content` were duplicated verbatim in `tests/behaviors/conftest.py`, which also held the only definition of the `role_request` they depend on. `portal_factory` gained a `container` flag so a type can hold pages, and `themed_portal` builds on it instead of declaring its own FTI. @ericof 

## 1.0.0a4 (2026-08-05)

No significant changes.


## 1.0.0a3 (2026-08-03)

No significant changes.


## 1.0.0a2 (2026-07-31)

No significant changes.


## 1.0.0a1 (2026-07-30)


### New features:

- Added example content showcasing the new blocks and elements, and included Link in the navigation displayed types. @ericof [#4](https://github.com/simplesconsultoria/sc-volto-light-theme/issues/4)
- Added a backend container image that ships with a Plone site and the example content already created, so the demo stack starts with a populated site. @ericof [#7](https://github.com/simplesconsultoria/sc-volto-light-theme/issues/7)
- Added a footer behavior with a brand slogan and a brand message, and enabled the kitconcept footer behavior so a site can set its own footer logo. Both are editable per site and subsite, and the example content now fills them in. @ericof

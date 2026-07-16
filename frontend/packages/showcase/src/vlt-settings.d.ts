// The theme declares the `settings.vlt` augmentation on '@plone/types' inside
// its config/settings module. Nothing in this add-on imports that module, so
// without pulling it in here `config.settings.vlt` would be `unknown`. A
// type-only import loads the augmentation and emits nothing.
import type {} from '@simplesconsultoria/volto-light-theme/config/settings';

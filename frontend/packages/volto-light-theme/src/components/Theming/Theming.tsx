import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import type { Content } from '@plone/types';
import { useLiveData } from '../../helpers/useLiveData';
import { themeSettingsOf, themeStyleSheet } from '../../helpers/themeStyles';
import type { SerializedTheme } from '../../types/theme';

export const THEME_BEHAVIOR = 'sc.voltolighttheme.themeselector';

/**
 * Apply the selected theme by overriding the colour custom properties.
 *
 * Replaces the upstream `@kitconcept/volto-light-theme` component of the same
 * name through the customization in `src/customizations`, so it inherits
 * upstream's own `aboveHeader` slot registration — the rule goes into
 * `<head>`, so it covers the whole page regardless of the slot's position.
 *
 * The value comes from the `@inherit` expander, so a section inherits its
 * closest ancestor's theme, and `useLiveData` previews unsaved edits while the
 * form is open.
 */
const Theming = ({ content }: { content: Content }) => {
  const theme = useLiveData<SerializedTheme>(content, THEME_BEHAVIOR, 'theme');
  const styles = themeStyleSheet(themeSettingsOf(theme));

  if (!styles) return null;

  return (
    <Helmet>
      <style type="text/css" data-sc-theme={theme?.token ?? ''}>
        {styles}
      </style>
    </Helmet>
  );
};

export default Theming;

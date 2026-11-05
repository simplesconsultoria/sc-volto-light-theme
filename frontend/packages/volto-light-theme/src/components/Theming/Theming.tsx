import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import config from '@plone/volto/registry';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import type { Content } from '@plone/types';
import { getInherit } from '../../actions/inherit/inherit';
import { useLiveData } from '../../helpers/useLiveData';
import { themeSettingsOf, themeStyleSheet } from '../../helpers/themeStyles';
import {
  DEFAULT_BLOCK_THEMES,
  DEFAULT_COLOR_GROUPS,
} from '../../config/blockThemes';
import type { SerializedTheme } from '../../types/theme';
import type { InheritRootState } from '../../types/inherit';

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
 *
 * On 404 pages the normal GET_CONTENT request fails, so the inherit expander
 * is never included in its response. In that case we detect the errorContext
 * in Redux and manually fetch @inherit from the site root so the theme is
 * still applied.
 */
const Theming = ({ content }: { content: Content }) => {
  const dispatch = useDispatch();

  // errorContext is populated by Volto when the content request returns 404.
  const errorContext = useSelector((state: any) => state.errorContext);

  // Whether we already have inherit data in the store.
  const inheritLoaded = useSelector(
    (state: InheritRootState) => state.inherit?.loaded,
  );
  const inheritLoading = useSelector(
    (state: InheritRootState) => state.inherit?.loading,
  );

  const theme = useLiveData<SerializedTheme>(content, THEME_BEHAVIOR, 'theme');
  const settings = themeSettingsOf(theme);
  const styles = themeStyleSheet(settings);

  // Synchronously ensure active blockThemes and colorGroups are registered in config.blocks
  if (settings?.block_themes && (config as any)?.blocks) {
    const bts = Array.isArray(settings.block_themes)
      ? Object.fromEntries(
          settings.block_themes.filter(Boolean).map((b) => [b.id, b]),
        )
      : settings.block_themes;
    (config as any).blocks.blockThemes = {
      ...DEFAULT_BLOCK_THEMES,
      ...((config as any).blocks.blockThemes || {}),
      ...bts,
    };
  }
  if (settings?.color_groups && (config as any)?.blocks) {
    const cgs = Array.isArray(settings.color_groups)
      ? Object.fromEntries(
          settings.color_groups.filter(Boolean).map((c) => [c.id, c]),
        )
      : settings.color_groups;
    (config as any).blocks.colorGroups = {
      ...DEFAULT_COLOR_GROUPS,
      ...((config as any).blocks.colorGroups || {}),
      ...cgs,
    };
  }

  useEffect(() => {
    // Only act when we are on a 404 page and inherit data has not been fetched.
    if (!errorContext) return;
    if (inheritLoaded || inheritLoading) return;

    // Fetch @inherit from the site root so the 404 page still picks up the
    // theme. Using '' (empty string) resolves to the Plone site root, which
    // always exists regardless of which URL the user typed.
    dispatch(getInherit('', [THEME_BEHAVIOR]));
  }, [errorContext, inheritLoaded, inheritLoading, dispatch]);

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

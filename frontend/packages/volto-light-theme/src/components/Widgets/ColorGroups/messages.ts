import { defineMessages } from 'react-intl';

/**
 * Shared by the Color Groups widget and every piece of it.
 *
 * Kept in one module so a label used by several parts (the colour roles, the
 * light/dark modes) cannot drift into two ids. Ids already used elsewhere in
 * the add-on (`Cover`, `Contain`, the position names) are reused as-is so the
 * catalog keeps a single entry for them.
 */
export const messages = defineMessages({
  // Widget
  colorGroups: { id: 'Color Groups', defaultMessage: 'Color Groups' },
  colorGroupsHelp: {
    id: 'A Color Group defines a set of 4 colours (background, text, subtext and accent), an image or CSS pattern layer laid over the background colour, and a text font. Click a group to expand and edit it.',
    defaultMessage:
      'A Color Group defines a set of 4 colours (background, text, subtext and accent), an image or CSS pattern layer laid over the background colour, and a text font. Click a group to expand and edit it.',
  },

  // Colour roles and modes
  background: { id: 'Background', defaultMessage: 'Background' },
  backgroundLayer: {
    id: '1st layer: Background',
    defaultMessage: '1st layer: Background',
  },
  text: { id: 'Text', defaultMessage: 'Text' },
  subtext: { id: 'Subtext', defaultMessage: 'Subtext' },
  accent: { id: 'Accent', defaultMessage: 'Accent' },
  light: { id: 'Light', defaultMessage: 'Light' },
  dark: { id: 'Dark', defaultMessage: 'Dark' },
  lightMode: { id: 'Light mode', defaultMessage: 'Light mode' },
  darkMode: { id: 'Dark mode', defaultMessage: 'Dark mode' },
  colorInMode: { id: '{label} ({mode})', defaultMessage: '{label} ({mode})' },
  colorInModeHex: {
    id: '{label} ({mode}), hex',
    defaultMessage: '{label} ({mode}), hex',
  },
  colorPair: {
    id: '{label} (Light / Dark)',
    defaultMessage: '{label} (Light / Dark)',
  },
  swatchTitle: { id: '{label}: {value}', defaultMessage: '{label}: {value}' },

  // New group form
  addColorGroup: {
    id: 'Add new Color Group',
    defaultMessage: 'Add new Color Group',
  },
  addColorGroupHelp: {
    id: 'A new Color Group created in this theme is automatically synced to every other theme of the site with default values.',
    defaultMessage:
      'A new Color Group created in this theme is automatically synced to every other theme of the site with default values.',
  },
  idRequired: {
    id: 'The Color Group ID is required.',
    defaultMessage: 'The Color Group ID is required.',
  },
  idExists: {
    id: 'A Color Group with the ID "{id}" already exists.',
    defaultMessage: 'A Color Group with the ID "{id}" already exists.',
  },
  groupId: { id: 'Group ID (e.g. red)', defaultMessage: 'Group ID (e.g. red)' },
  groupIdPlaceholder: { id: 'e.g. red', defaultMessage: 'e.g. red' },
  displayName: { id: 'Display name', defaultMessage: 'Display name' },
  displayNamePlaceholder: {
    id: 'e.g. Christmas Red',
    defaultMessage: 'e.g. Christmas Red',
  },
  font: { id: 'Font', defaultMessage: 'Font' },
  example: { id: 'e.g. {example}', defaultMessage: 'e.g. {example}' },
  initialLayer: {
    id: '2nd layer: initial image or CSS pattern (light, desktop)',
    defaultMessage: '2nd layer: initial image or CSS pattern (light, desktop)',
  },
  imageOrPatternPlaceholder: {
    id: 'https://... or radial-gradient(...)',
    defaultMessage: 'https://... or radial-gradient(...)',
  },
  saveNewColorGroup: {
    id: 'Save new Color Group',
    defaultMessage: 'Save new Color Group',
  },

  // Group card
  deleteColorGroup: {
    id: 'Delete Color Group {name}',
    defaultMessage: 'Delete Color Group {name}',
  },
  baseGroup: { id: 'Base', defaultMessage: 'Base' },
  baseGroupTitle: {
    id: 'Protected base group',
    defaultMessage: 'Protected base group',
  },
  layerActive: { id: '2nd layer active', defaultMessage: '2nd layer active' },
  layerActiveTitle: {
    id: 'Has a 2nd image or pattern layer set',
    defaultMessage: 'Has a 2nd image or pattern layer set',
  },
  fontFamily: { id: 'Font family', defaultMessage: 'Font family' },
  groupPreview: {
    id: 'Group preview (colour + 2nd layer on top)',
    defaultMessage: 'Group preview (colour + 2nd layer on top)',
  },
  toggleDevice: {
    id: 'Toggle device simulation',
    defaultMessage: 'Toggle device simulation',
  },
  simulate: { id: 'Simulate: {device}', defaultMessage: 'Simulate: {device}' },
  desktop: { id: 'Desktop', defaultMessage: 'Desktop' },
  mobileSmallScreens: {
    id: 'Mobile (small screens)',
    defaultMessage: 'Mobile (small screens)',
  },
  previewTitle: { id: '{name} title', defaultMessage: '{name} title' },
  previewText: {
    id: 'Background colour with a 2nd layer on top.',
    defaultMessage: 'Background colour with a 2nd layer on top.',
  },
  previewAccent: { id: 'Accent action', defaultMessage: 'Accent action' },

  // Pattern / image layer
  layerBadge: { id: '2nd layer', defaultMessage: '2nd layer' },
  layerTitle: {
    id: 'Background image and CSS patterns',
    defaultMessage: 'Background image and CSS patterns',
  },
  layerHelp: {
    id: 'Add an image (link or file) or a CSS pattern. The image is rendered on top of the background colour set above, allowing transparency and responsive layering.',
    defaultMessage:
      'Add an image (link or file) or a CSS pattern. The image is rendered on top of the background colour set above, allowing transparency and responsive layering.',
  },
  presets: {
    id: 'Ready-made CSS patterns (Acreative-style presets)',
    defaultMessage: 'Ready-made CSS patterns (Acreative-style presets)',
  },
  lightDesktopImage: {
    id: 'Desktop (file, link or CSS pattern)',
    defaultMessage: 'Desktop (file, link or CSS pattern)',
  },
  lightMobileImage: {
    id: 'Mobile (optional, for a different image on small screens)',
    defaultMessage: 'Mobile (optional, for a different image on small screens)',
  },
  darkDesktopImage: {
    id: 'Desktop (optional, falls back to the light version when empty)',
    defaultMessage:
      'Desktop (optional, falls back to the light version when empty)',
  },
  darkMobileImage: {
    id: 'Mobile (optional, small screens in dark mode)',
    defaultMessage: 'Mobile (optional, small screens in dark mode)',
  },
  uploadImage: {
    id: 'Upload an image from your computer',
    defaultMessage: 'Upload an image from your computer',
  },
  file: { id: 'File', defaultMessage: 'File' },
  clearImage: { id: 'Clear image', defaultMessage: 'Clear image' },

  // Layer sizing controls
  sizeLabel: {
    id: 'Size (background-size)',
    defaultMessage: 'Size (background-size)',
  },
  repeatLabel: {
    id: 'Repeat (background-repeat)',
    defaultMessage: 'Repeat (background-repeat)',
  },
  positionLabel: {
    id: 'Position (background-position)',
    defaultMessage: 'Position (background-position)',
  },
  cssPatterns: { id: 'CSS patterns', defaultMessage: 'CSS patterns' },
  customValue: {
    id: 'or type a custom value (e.g. {example})',
    defaultMessage: 'or type a custom value (e.g. {example})',
  },

  // Size options
  sizeCover: { id: 'Cover', defaultMessage: 'Cover' },
  sizeCoverTitle: {
    id: 'Fill the whole block (cover)',
    defaultMessage: 'Fill the whole block (cover)',
  },
  sizeContain: { id: 'Contain', defaultMessage: 'Contain' },
  sizeContainTitle: {
    id: 'Fit the whole image without cropping (contain)',
    defaultMessage: 'Fit the whole image without cropping (contain)',
  },
  sizeAuto: { id: 'Auto', defaultMessage: 'Auto' },
  sizeAutoTitle: {
    id: 'Original image size (auto)',
    defaultMessage: 'Original image size (auto)',
  },
  sizeFullWidth: { id: '100% width', defaultMessage: '100% width' },
  sizeFullWidthTitle: {
    id: 'Stretched to full width (100% auto)',
    defaultMessage: 'Stretched to full width (100% auto)',
  },
  sizeSmallPattern: {
    id: 'Small size for patterns ({size})',
    defaultMessage: 'Small size for patterns ({size})',
  },
  sizeMediumPattern: {
    id: 'Medium size for patterns ({size})',
    defaultMessage: 'Medium size for patterns ({size})',
  },
  sizeLargePattern: {
    id: 'Large size for patterns ({size})',
    defaultMessage: 'Large size for patterns ({size})',
  },

  // Repeat options
  repeat: { id: 'Repeat', defaultMessage: 'Repeat' },
  repeatTitle: {
    id: 'Repeat the image on X and Y (repeat)',
    defaultMessage: 'Repeat the image on X and Y (repeat)',
  },
  repeatX: { id: 'Horizontal', defaultMessage: 'Horizontal' },
  repeatXShort: { id: 'Repeat X', defaultMessage: 'Repeat X' },
  repeatXTitle: {
    id: 'Repeat horizontally only (repeat-x)',
    defaultMessage: 'Repeat horizontally only (repeat-x)',
  },
  repeatY: { id: 'Vertical', defaultMessage: 'Vertical' },
  repeatYShort: { id: 'Repeat Y', defaultMessage: 'Repeat Y' },
  repeatYTitle: {
    id: 'Repeat vertically only (repeat-y)',
    defaultMessage: 'Repeat vertically only (repeat-y)',
  },
  noRepeat: { id: 'No repeat', defaultMessage: 'No repeat' },
  noRepeatShort: { id: 'Once', defaultMessage: 'Once' },
  noRepeatTitle: {
    id: 'Do not repeat the image (no-repeat)',
    defaultMessage: 'Do not repeat the image (no-repeat)',
  },
  repeatRound: { id: 'Fit', defaultMessage: 'Fit' },
  repeatRoundShort: { id: 'Round', defaultMessage: 'Round' },
  repeatRoundTitle: {
    id: 'Repeat, adjusting proportions without cropping (round)',
    defaultMessage: 'Repeat, adjusting proportions without cropping (round)',
  },
  repeatSpace: { id: 'Spaced', defaultMessage: 'Spaced' },
  repeatSpaceShort: { id: 'Space', defaultMessage: 'Space' },
  repeatSpaceTitle: {
    id: 'Space evenly (space)',
    defaultMessage: 'Space evenly (space)',
  },

  // Position compass (ids shared with the Listing block schema)
  positionLeftTop: { id: 'Left top', defaultMessage: 'Left top' },
  positionCenterTop: { id: 'Center top', defaultMessage: 'Center top' },
  positionRightTop: { id: 'Right top', defaultMessage: 'Right top' },
  positionLeftCenter: { id: 'Left center', defaultMessage: 'Left center' },
  positionCenter: { id: 'Center', defaultMessage: 'Center' },
  positionRightCenter: { id: 'Right center', defaultMessage: 'Right center' },
  positionLeftBottom: { id: 'Left bottom', defaultMessage: 'Left bottom' },
  positionCenterBottom: {
    id: 'Center bottom',
    defaultMessage: 'Center bottom',
  },
  positionRightBottom: { id: 'Right bottom', defaultMessage: 'Right bottom' },
});

import {
  IconRepeatAll,
  IconRepeatX,
  IconRepeatY,
  IconNoRepeat,
  IconRepeatRound,
  IconRepeatSpace,
  IconSizeCover,
  IconSizeContain,
  IconSizeAuto,
  IconSizeWidth,
} from './icons';
import { messages } from './messages';

export const SIZE_OPTIONS = [
  {
    value: 'cover',
    label: messages.sizeCover,
    shortLabel: messages.sizeCover,
    icon: IconSizeCover,
    title: messages.sizeCoverTitle,
  },
  {
    value: 'contain',
    label: messages.sizeContain,
    shortLabel: messages.sizeContain,
    icon: IconSizeContain,
    title: messages.sizeContainTitle,
  },
  {
    value: 'auto',
    label: messages.sizeAuto,
    shortLabel: messages.sizeAuto,
    icon: IconSizeAuto,
    title: messages.sizeAutoTitle,
  },
  {
    value: '100% auto',
    label: messages.sizeFullWidth,
    shortLabel: messages.sizeFullWidth,
    icon: IconSizeWidth,
    title: messages.sizeFullWidthTitle,
  },
];

export const SIZE_PATTERN_PILLS = [
  {
    value: '24px 24px',
    label: '24px',
    title: messages.sizeSmallPattern,
  },
  {
    value: '32px 32px',
    label: '32px',
    title: messages.sizeMediumPattern,
  },
  {
    value: '50px 50px',
    label: '50px',
    title: messages.sizeLargePattern,
  },
];

export const REPEAT_OPTIONS = [
  {
    value: 'repeat',
    label: messages.repeat,
    shortLabel: messages.repeat,
    icon: IconRepeatAll,
    title: messages.repeatTitle,
  },
  {
    value: 'repeat-x',
    label: messages.repeatX,
    shortLabel: messages.repeatXShort,
    icon: IconRepeatX,
    title: messages.repeatXTitle,
  },
  {
    value: 'repeat-y',
    label: messages.repeatY,
    shortLabel: messages.repeatYShort,
    icon: IconRepeatY,
    title: messages.repeatYTitle,
  },
  {
    value: 'no-repeat',
    label: messages.noRepeat,
    shortLabel: messages.noRepeatShort,
    icon: IconNoRepeat,
    title: messages.noRepeatTitle,
  },
  {
    value: 'round',
    label: messages.repeatRound,
    shortLabel: messages.repeatRoundShort,
    icon: IconRepeatRound,
    title: messages.repeatRoundTitle,
  },
  {
    value: 'space',
    label: messages.repeatSpace,
    shortLabel: messages.repeatSpaceShort,
    icon: IconRepeatSpace,
    title: messages.repeatSpaceTitle,
  },
];

export const POSITION_COMPASS = [
  {
    value: 'top left',
    label: messages.positionLeftTop,
    arrow: '↖',
    idKey: 'top-left',
  },
  {
    value: 'top center',
    label: messages.positionCenterTop,
    arrow: '↑',
    idKey: 'top-center',
  },
  {
    value: 'top right',
    label: messages.positionRightTop,
    arrow: '↗',
    idKey: 'top-right',
  },
  {
    value: 'center left',
    label: messages.positionLeftCenter,
    arrow: '←',
    idKey: 'center-left',
  },
  {
    value: 'center',
    label: messages.positionCenter,
    arrow: '•',
    idKey: 'center',
  },
  {
    value: 'center right',
    label: messages.positionRightCenter,
    arrow: '→',
    idKey: 'center-right',
  },
  {
    value: 'bottom left',
    label: messages.positionLeftBottom,
    arrow: '↙',
    idKey: 'bottom-left',
  },
  {
    value: 'bottom center',
    label: messages.positionCenterBottom,
    arrow: '↓',
    idKey: 'bottom-center',
  },
  {
    value: 'bottom right',
    label: messages.positionRightBottom,
    arrow: '↘',
    idKey: 'bottom-right',
  },
];

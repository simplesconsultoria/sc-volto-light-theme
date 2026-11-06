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

export const SIZE_OPTIONS = [
  {
    value: 'cover',
    label: 'Cover',
    shortLabel: 'Cover',
    icon: IconSizeCover,
    title: 'Preencher todo o bloco (cover)',
  },
  {
    value: 'contain',
    label: 'Contain',
    shortLabel: 'Contain',
    icon: IconSizeContain,
    title: 'Conter imagem inteira sem cortar (contain)',
  },
  {
    value: 'auto',
    label: 'Auto',
    shortLabel: 'Auto',
    icon: IconSizeAuto,
    title: 'Tamanho original da imagem (auto)',
  },
  {
    value: '100% auto',
    label: '100% Largura',
    shortLabel: '100% Largura',
    icon: IconSizeWidth,
    title: 'Largura total esticada (100% auto)',
  },
];

export const SIZE_PATTERN_PILLS = [
  {
    value: '24px 24px',
    label: '24px',
    title: 'Tamanho pequeno para patterns (24px 24px)',
  },
  {
    value: '32px 32px',
    label: '32px',
    title: 'Tamanho médio para patterns (32px 32px)',
  },
  {
    value: '50px 50px',
    label: '50px',
    title: 'Tamanho grande para patterns (50px 50px)',
  },
];

export const REPEAT_OPTIONS = [
  {
    value: 'repeat',
    label: 'Repetir',
    shortLabel: 'Repetir',
    icon: IconRepeatAll,
    title: 'Repetir imagem no X e no Y (repeat)',
  },
  {
    value: 'repeat-x',
    label: 'Horizontal',
    shortLabel: 'Repetir X',
    icon: IconRepeatX,
    title: 'Repetir apenas na horizontal (repeat-x)',
  },
  {
    value: 'repeat-y',
    label: 'Vertical',
    shortLabel: 'Repetir Y',
    icon: IconRepeatY,
    title: 'Repetir apenas na vertical (repeat-y)',
  },
  {
    value: 'no-repeat',
    label: 'Não repetir',
    shortLabel: '1x Única',
    icon: IconNoRepeat,
    title: 'Não repetir a imagem (no-repeat)',
  },
  {
    value: 'round',
    label: 'Ajustar',
    shortLabel: 'Round',
    icon: IconRepeatRound,
    title: 'Repetir ajustando proporções sem corte (round)',
  },
  {
    value: 'space',
    label: 'Espaçado',
    shortLabel: 'Space',
    icon: IconRepeatSpace,
    title: 'Espaçar uniformemente (space)',
  },
];

export const POSITION_COMPASS = [
  {
    value: 'top left',
    label: 'Superior Esquerdo (↖)',
    arrow: '↖',
    idKey: 'top-left',
  },
  {
    value: 'top center',
    label: 'Superior Centro (↑)',
    arrow: '↑',
    idKey: 'top-center',
  },
  {
    value: 'top right',
    label: 'Superior Direito (↗)',
    arrow: '↗',
    idKey: 'top-right',
  },
  {
    value: 'center left',
    label: 'Centro Esquerdo (←)',
    arrow: '←',
    idKey: 'center-left',
  },
  { value: 'center', label: 'Centro (•)', arrow: '•', idKey: 'center' },
  {
    value: 'center right',
    label: 'Centro Direito (→)',
    arrow: '→',
    idKey: 'center-right',
  },
  {
    value: 'bottom left',
    label: 'Inferior Esquerdo (↙)',
    arrow: '↙',
    idKey: 'bottom-left',
  },
  {
    value: 'bottom center',
    label: 'Inferior Centro (↓)',
    arrow: '↓',
    idKey: 'bottom-center',
  },
  {
    value: 'bottom right',
    label: 'Inferior Direito (↘)',
    arrow: '↘',
    idKey: 'bottom-right',
  },
];

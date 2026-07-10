import type { ObjectBrowserItem } from '@plone/types';

export interface HeroBlockData {
  headerText?: string;
  title?: string;
  description?: string;
  footerText?: string;
  tags?: string[];
  url?: string;
  preview_image?: Array<ObjectBrowserItem>;
  image_field?: string;
  image_scales?: Record<string, any>;
  button?: boolean;
  buttonLink?: Array<ObjectBrowserItem>;
  buttonText?: string;
  fullWidth?: boolean;
  textSide?: 'left' | 'right';
  variation?: 'flex' | 'card';
  fileType?: string;
  href?: Array<ObjectBrowserItem>;
  theme?: string;
  styles?: Record<string, any>;
  overwrite?: boolean;
  imageFit?: 'cover' | 'contain';
  imageSize?: string;
  titleTag?: string;
  showDate?: boolean;
}

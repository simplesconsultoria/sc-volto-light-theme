import React from 'react';
import config from '@plone/volto/registry';
import Card from '@kitconcept/volto-light-theme/primitives/Card/Card';
import type { ImageInformation } from './imageInformation';

interface CardViewProps {
  imageInfo: ImageInformation;
}

const CardImage: React.FC<CardViewProps> = ({ imageInfo }) => {
  const ImageComponent = config.getComponent('Image').component;
  const props = {
    item: imageInfo.imageItem || undefined,
    src: imageInfo.imageSrc || undefined,
    imageComponent: ImageComponent,
  };
  return <Card.Image {...props} />;
};

export default CardImage;

import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

interface AdapterParams {
  block: string;
  data: Record<string, any>;
  id: string;
  onChangeBlock: (id: string, data: Record<string, any>) => void;
  value: any;
  content?: Record<string, any>;
  item?: Record<string, any>;
}

export const heroBlockDataAdapter = ({
  block,
  data,
  id,
  onChangeBlock,
  value,
  content,
  item,
}: AdapterParams): void => {
  let dataSaved: Record<string, any> = {
    ...data,
    [id]: value,
  };

  if (id === 'url') {
    if (value === null) {
      dataSaved = {
        ...dataSaved,
        image_field: undefined,
        image_scales: undefined,
      };
    } else if (typeof value === 'object') {
      dataSaved = {
        ...dataSaved,
        [id]: flattenToAppURL(value['@id']),
        image_field: 'image',
        image_scales: value.image_scales,
      };
    } else if (typeof value === 'string' && content) {
      dataSaved = {
        ...dataSaved,
        image_field: 'image',
        image_scales: { image: [content?.image] },
      };
    } else if (typeof value === 'string' && item) {
      dataSaved = {
        ...dataSaved,
        image_field: item.image_field,
        image_scales: item.image_scales,
      };
    }
  }

  if (id === 'href') {
    if (value && value.length > 0) {
      // If buttonLink is empty, or it currently matches the old href, update it to the new href
      if (
        !data.buttonLink ||
        data.buttonLink.length === 0 ||
        (data.href &&
          data.href.length > 0 &&
          data.buttonLink[0]?.['@id'] === data.href[0]?.['@id'])
      ) {
        dataSaved = {
          ...dataSaved,
          buttonLink: value,
        };
      }
    } else if (value === null || value?.length === 0) {
      // If href is cleared and buttonLink matched it, clear buttonLink too
      if (
        data.href &&
        data.href.length > 0 &&
        data.buttonLink &&
        data.buttonLink.length > 0 &&
        data.buttonLink[0]?.['@id'] === data.href[0]?.['@id']
      ) {
        dataSaved = {
          ...dataSaved,
          buttonLink: [],
        };
      }
    }
  }

  onChangeBlock(block, dataSaved);
};

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocumentByLineDataForm from './DocumentByLine/Data';
import MainImageBlockDataForm from './MainImageBlock/Data';
import HeroBlockDataForm from './HeroBlock/Data';
import QuoteBlockDataForm from './QuoteBlock/Data';
import CustomGridDataForm from './CustomGrid/Data';
import EventMetadataDataForm from './EventMetadata/Data';

const { blockDataFormSpy } = vi.hoisted(() => ({
  blockDataFormSpy: vi.fn(),
}));

vi.mock('@plone/volto/components/manage/Form/BlockDataForm', () => ({
  default: (props: any) => {
    blockDataFormSpy(props);
    return <div className="block-data-form">BlockDataForm</div>;
  },
}));

const mockStore = configureStore();

const store = mockStore({
  intl: { locale: 'en', messages: {} },
  content: { subrequests: {} },
});

/** Props a block sidebar receives from the block editor. */
function sidebarProps(type: string, overrides: Record<string, any> = {}) {
  return {
    data: { '@type': type },
    block: 'block-1',
    onChangeBlock: vi.fn(),
    navRoot: { '@id': 'https://example.org' },
    contentType: 'Document',
    blocksErrors: { field: 'error' },
    blocksConfig: {},
    ...overrides,
  };
}

/** The props that `BlockDataForm` received on its last render. */
function lastFormProps() {
  const calls = blockDataFormSpy.mock.calls;
  return calls[calls.length - 1][0];
}

const FORMS: [string, React.FC<any>][] = [
  ['documentByline', DocumentByLineDataForm],
  ['mainImageBlock', MainImageBlockDataForm],
  ['heroBlock', HeroBlockDataForm],
  ['quoteBlock', QuoteBlockDataForm],
  ['customGrid', CustomGridDataForm],
  ['eventMetadata', EventMetadataDataForm],
];

describe.each(FORMS)('%s sidebar form', (type, Form) => {
  beforeEach(() => {
    blockDataFormSpy.mockClear();
  });

  const renderForm = (props: Record<string, any>) =>
    render(
      <Provider store={store}>
        <Form {...props} />
      </Provider>,
    );

  it('passes the block id and the stored data', () => {
    const props = sidebarProps(type);
    renderForm(props);
    const form = lastFormProps();
    expect(form.block).toBe('block-1');
    expect(form.formData).toBe(props.data);
  });

  it('passes the block change handler, so defaults are stored', () => {
    const props = sidebarProps(type);
    renderForm(props);
    expect(lastFormProps().onChangeBlock).toBe(props.onChangeBlock);
  });

  it('passes the blocks configuration', () => {
    const props = sidebarProps(type);
    renderForm(props);
    expect(lastFormProps().blocksConfig).toBe(props.blocksConfig);
  });

  it('passes the navigation root and the content type', () => {
    const props = sidebarProps(type);
    renderForm(props);
    const form = lastFormProps();
    expect(form.navRoot).toBe(props.navRoot);
    expect(form.contentType).toBe('Document');
  });

  it('passes the block errors as errors', () => {
    const props = sidebarProps(type);
    renderForm(props);
    expect(lastFormProps().errors).toBe(props.blocksErrors);
  });

  it('reads the schema from the block configuration when it has one', () => {
    const props = sidebarProps(type, {
      blocksConfig: {
        [type]: {
          blockSchema: () => ({
            title: 'Configured title',
            fieldsets: [],
            properties: {},
          }),
        },
      },
    });
    renderForm(props);
    const form = lastFormProps();
    expect(form.title).toBe('Configured title');
    expect(form.schema.title).toBe('Configured title');
  });
});

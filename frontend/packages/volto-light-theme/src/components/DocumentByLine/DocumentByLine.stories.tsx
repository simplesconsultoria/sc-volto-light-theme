import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';
import type { Content } from '@plone/types';

import DocumentByLine from './DocumentByLine';

const withWrapper: Decorator = (Story) => {
  return (
    <Wrapper anonymous>
      <div style={{ padding: '2rem', maxWidth: '760px', margin: '0 auto' }}>
        <Story />
      </div>
    </Wrapper>
  );
};

const sampleContent = {
  '@type': 'Document',
  effective: '2026-07-01T09:30:00+00:00',
  modified: '2026-07-10T14:45:00+00:00',
  creators: ['admin'],
  '@components': {
    authors: [{ fullname: 'Matheus Nunes' }, { fullname: 'Ericof' }],
  },
} as Content;

const meta = {
  title: 'Public/DocumentByLine',
  component: DocumentByLine,
  decorators: [withWrapper],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'object' },
    showModified: { control: 'boolean' },
    showPublished: { control: 'boolean' },
    showAuthor: { control: 'boolean' },
  },
} satisfies Meta<typeof DocumentByLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllFields: Story = {
  args: {
    content: sampleContent,
    showModified: true,
    showPublished: true,
    showAuthor: true,
  },
};

export const DatesOnly: Story = {
  args: {
    content: sampleContent,
    showModified: true,
    showPublished: true,
    showAuthor: false,
  },
};

export const AuthorsOnly: Story = {
  args: {
    content: sampleContent,
    showModified: false,
    showPublished: false,
    showAuthor: true,
  },
};

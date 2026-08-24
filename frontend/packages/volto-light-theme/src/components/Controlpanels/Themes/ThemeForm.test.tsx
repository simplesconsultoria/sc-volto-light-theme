/**
 * What `ThemeForm` hands to Volto's `Form`.
 *
 * `Form` and the `Field`s inside it are `@loadable/component`s: in a browser
 * they resolve and render, in jsdom they render `null`, so asserting on the
 * produced inputs here would only ever assert the absence of a chunk loader.
 * The props are the part that is ours, and they are what these tests pin.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import ThemeForm from './ThemeForm';
import { corporateTheme, schema } from './fixtures';

const received: Record<string, any>[] = [];

vi.mock('@plone/volto/components/manage/Form', () => ({
  Form: (props: Record<string, any>) => {
    received.push(props);
    return <form data-testid="volto-form" />;
  },
}));

const renderForm = (props: Record<string, unknown>) => {
  received.length = 0;
  render(
    <IntlProvider locale="en" defaultLocale="en" messages={{}}>
      <ThemeForm
        schema={schema}
        adding={false}
        onSubmit={() => {}}
        onCancel={() => {}}
        {...props}
      />
    </IntlProvider>,
  );
  return received[0];
};

describe('ThemeForm', () => {
  it('edits with the schema as served', () => {
    const props = renderForm({ theme: corporateTheme });
    expect(props.schema.properties.id).toBeUndefined();
  });

  it('seeds the edit form with the theme itself', () => {
    const props = renderForm({ theme: corporateTheme });
    expect(props.formData).toBe(corporateTheme);
  });

  it('titles the edit form with the theme name', () => {
    const props = renderForm({ theme: corporateTheme });
    expect(props.title).toBe('Corporate');
  });

  it('falls back to the id when a theme has no name', () => {
    const props = renderForm({
      theme: { '@id': '/x', id: 'unnamed' },
    });
    expect(props.title).toBe('unnamed');
  });

  it('adds a required id field when adding', () => {
    const props = renderForm({ adding: true });
    expect(props.schema.properties.id).toBeDefined();
    expect(props.schema.required).toContain('id');
  });

  it('starts a plain add form empty', () => {
    const props = renderForm({ adding: true });
    expect(props.formData).toEqual({});
  });

  it('seeds a duplicate from the source, with a suffixed name', () => {
    const props = renderForm({ adding: true, cloneOf: corporateTheme });
    expect(props.formData.name).toBe('Corporate (copy)');
    expect(props.formData.primary_color).toBe(corporateTheme.primary_color);
  });

  it('does not carry the identity into a duplicate', () => {
    const props = renderForm({ adding: true, cloneOf: corporateTheme });
    expect(props.formData.id).toBeUndefined();
    expect(props.formData['@id']).toBeUndefined();
  });

  it('hides the form actions, which live in the toolbar', () => {
    const props = renderForm({ theme: corporateTheme });
    expect(props.hideActions).toBe(true);
  });
});

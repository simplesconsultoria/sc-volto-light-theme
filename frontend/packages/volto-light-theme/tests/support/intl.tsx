/**
 * Render a component inside an `IntlProvider`, as Volto does at runtime.
 *
 * Components using `useIntl()` throw without a provider. With no `messages`,
 * every message renders its English `defaultMessage`.
 */
import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { IntlProvider as ReactIntlProvider } from 'react-intl';

// react-intl 3's class types predate React 18, where `children` must be
// declared explicitly, so its provider accepts no children as typed.
const IntlProvider = ReactIntlProvider as unknown as React.ComponentType<
  React.PropsWithChildren<{
    messages: Record<string, string>;
    locale: string;
    defaultLocale?: string;
  }>
>;

export function renderWithIntl(
  ui: React.ReactElement,
  {
    locale = 'en',
    messages = {},
    ...options
  }: RenderOptions & {
    locale?: string;
    messages?: Record<string, string>;
  } = {},
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <IntlProvider locale={locale} messages={messages} defaultLocale="en">
      {children}
    </IntlProvider>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

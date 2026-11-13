import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { describe, it, expect } from 'vitest';
import Anontools from './Anontools';

const mockStore = configureStore();

/** A store with pt-BR messages and the given user actions. */
function storeWith(ids: string[]) {
  return mockStore({
    intl: {
      locale: 'pt-BR',
      messages: {
        'Log in': 'Entrar',
        Register: 'Registrar',
        'Log out': 'Sair',
      },
    },
    content: { data: { '@id': 'http://localhost:3000/news' } },
    actions: { actions: { user: ids.map((id) => ({ id })) } },
  });
}

function renderWith(ids: string[]) {
  return render(
    <Provider store={storeWith(ids)}>
      <MemoryRouter>
        <Anontools />
      </MemoryRouter>
    </Provider>,
  );
}

describe('Anontools', () => {
  it.each([
    ['login', 'Entrar', '/login?return_url=/news'],
    ['join', 'Registrar', '/register'],
    ['logout', 'Sair', '/logout'],
  ])('names the %s link by its visible, translated text', (id, text, href) => {
    renderWith([id]);
    const link = screen.getByRole('link', { name: text });
    expect(link).toHaveAttribute('href', href);
    expect(link).not.toHaveAttribute('aria-label');
  });

  it('renders nothing without user actions', () => {
    renderWith([]);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});

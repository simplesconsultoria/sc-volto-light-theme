import type { NavigationItem } from './types';

/**
 * Mock navigation data shared across the Navigation component stories.
 *
 * The shape mirrors what the `@plone/volto` navigation reducer produces from
 * the `@navigation` REST API endpoint: raw `@id` values are already flattened
 * to app-relative `url`s and only the fields consumed by the components are
 * kept. Reuse these fixtures instead of hand-rolling data in each story.
 */

/** "O Projeto" — a section with two children, exercises the fat-menu path. */
export const sobreNos: NavigationItem = {
  title: 'O Projeto',
  description:
    'Conheça quem somos, nossa carta de princípios e as pessoas que constroem o coletivo.',
  url: '/sobre-nos',
  items: [
    {
      title: 'Manifesto',
      description:
        'Carta de lançamento do projeto - Direito à comunicação e democracia',
      url: '/sobre-nos/manifesto',
      items: [],
    },
    {
      title: 'Integrantes',
      description: 'Participantes do coletivo.',
      url: '/sobre-nos/integrantes',
      items: [],
    },
  ],
};

/** "Nossas ações" — a single child, one of which has an empty description. */
export const nossasAcoes: NavigationItem = {
  title: 'Nossas ações',
  description: 'Ações do nosso coletivo',
  url: '/nossas-acoes',
  items: [
    {
      title: 'Notícias',
      description: '',
      url: '/nossas-acoes/noticias',
      items: [],
    },
  ],
};

/** "Fale conosco" — a leaf item without children, renders as a plain link. */
export const contato: NavigationItem = {
  title: 'Fale conosco',
  description:
    'Você quer entrar em contato com o projeto? Envie-nos uma mensagem através do campo abaixo, identificando-se e explicando o assunto, que retornaremos o contato o mais breve possível.',
  url: '/contato',
  items: [],
};

/** A single leaf child, handy for isolating SubMenuItem/SubMenuSection. */
export const manifesto: NavigationItem = sobreNos.items![0];

/** The full top-level navigation, as consumed by `Navigation`. */
export const navigationItems: NavigationItem[] = [
  sobreNos,
  nossasAcoes,
  contato,
];

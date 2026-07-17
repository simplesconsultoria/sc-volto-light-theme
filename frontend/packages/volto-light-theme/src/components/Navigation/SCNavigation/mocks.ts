import type { NavigationItem } from './types';

/**
 * Mock navigation data shared across the Navigation component stories.
 *
 * The shape mirrors what the `@plone/volto` navigation reducer produces from
 * the `@navigation` REST API endpoint: raw `@id` values are already flattened
 * to app-relative `url`s and only the fields consumed by the components are
 * kept. Reuse these fixtures instead of hand-rolling data in each story.
 */

/** "Sobre Nós" — a section with two children, exercises the fat-menu path. */
export const sobreNos: NavigationItem = {
  title: 'Sobre Nós',
  description:
    'Conheça quem somos, nossa missão e as pessoas que constroem a organização.',
  url: '/sobre-nos',
  items: [
    {
      title: 'Missão',
      description: 'Nossa missão e valores fundamentais.',
      url: '/sobre-nos/missao',
      items: [],
    },
    {
      title: 'Equipe',
      description: 'Conheça os membros da equipe.',
      url: '/sobre-nos/equipe',
      items: [],
    },
  ],
};

/** "Nossas ações" — a single child, one of which has an empty description. */
export const nossasAcoes: NavigationItem = {
  title: 'Nossas ações',
  description: 'Ações e projetos da organização.',
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

/** "Contato" — a leaf item without children, renders as a plain link. */
export const contato: NavigationItem = {
  title: 'Contato',
  description:
    'Entre em contato conosco. Envie-nos uma mensagem identificando-se e explicando o assunto.',
  url: '/contato',
  items: [],
};

/** A single leaf child, handy for isolating SubMenuItem/SubMenuSection. */
export const missao: NavigationItem = sobreNos.items![0];

/** The full top-level navigation, as consumed by `Navigation`. */
export const navigationItems: NavigationItem[] = [
  sobreNos,
  nossasAcoes,
  contato,
];

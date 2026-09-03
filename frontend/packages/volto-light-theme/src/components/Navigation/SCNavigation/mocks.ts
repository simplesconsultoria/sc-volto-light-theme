import type { NavigationItem } from './types';

/**
 * Mock navigation data shared across the Navigation component stories.
 *
 * The shape mirrors what the `@plone/volto` navigation reducer produces from
 * the `@navigation` REST API endpoint: raw `@id` values are already flattened
 * to app-relative `url`s and only the fields consumed by the components are
 * kept. Reuse these fixtures instead of hand-rolling data in each story.
 */

/** "About Us" — a section with two children, exercises the fat-menu path. */
export const aboutUs: NavigationItem = {
  title: 'About Us',
  description:
    'Learn who we are, our mission and the people who build the organisation.',
  url: '/about-us',
  items: [
    {
      title: 'Mission',
      description: 'Our mission and core values.',
      url: '/about-us/mission',
      items: [],
    },
    {
      title: 'Team',
      description: 'Meet the members of the team.',
      url: '/about-us/team',
      items: [],
    },
  ],
};

/** "Our Work" — a single child, whose description is empty. */
export const ourWork: NavigationItem = {
  title: 'Our Work',
  description: 'Initiatives and projects run by the organisation.',
  url: '/our-work',
  items: [
    {
      title: 'News',
      description: '',
      url: '/our-work/news',
      items: [],
    },
  ],
};

/** "Contact" — a leaf item without children, renders as a plain link. */
export const contact: NavigationItem = {
  title: 'Contact',
  description:
    'Get in touch with us. Send a message introducing yourself and explaining the subject.',
  url: '/contact',
  items: [],
};

/** A single leaf child, handy for isolating SubMenuItem/SubMenuSection. */
export const mission: NavigationItem = aboutUs.items![0];

/** The full top-level navigation, as consumed by `Navigation`. */
export const navigationItems: NavigationItem[] = [aboutUs, ourWork, contact];

/**
 * Attributes that take an off-screen carousel slide out of reach.
 *
 * `aria-hidden` alone hides the slide from screen readers but leaves its links
 * in the Tab order, so keyboard users land on content they cannot see (axe
 * `aria-hidden-focus`). `inert` removes the slide from focus and from the
 * accessibility tree.
 *
 * React 18 has no `inert` prop: an empty string renders the bare attribute.
 * React 19 treats `inert` as a boolean, so switch to `inert: true` then.
 */
export function slideA11yProps(isActive: boolean): Record<string, unknown> {
  return isActive ? {} : { 'aria-hidden': true, inert: '' };
}

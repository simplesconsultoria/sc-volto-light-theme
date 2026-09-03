/**
 * Shape a bundled photograph the way Plone's REST API shapes an image field.
 *
 * Volto's `Image` builds its `src` as `flattenToAppURL(base_path || item['@id'])`
 * joined to `download` (`Image.jsx:56-60`), so a fixture has to supply the two
 * halves rather than a whole URL. Splitting at the last `/` round-trips any form
 * the bundlers produce — a served path under Storybook, an inlined `data:` URI in
 * the Claude Design export — because rejoining with `/` reproduces the original
 * string exactly.
 *
 * `scales` is deliberately empty: there is one file per photograph, and Volto
 * skips `srcSet` entirely when the map is empty, so nothing claims to offer
 * widths that do not exist.
 *
 * :param url: the imported image URL.
 * :param width: intrinsic width in pixels.
 * :param height: intrinsic height in pixels.
 * :returns: an `image_scales` entry.
 */
export function imageScales(url: string, width = 1200, height = 675) {
  const cut = url.lastIndexOf('/');
  return {
    base_path: url.slice(0, cut),
    download: url.slice(cut + 1),
    width,
    height,
    scales: {},
  };
}

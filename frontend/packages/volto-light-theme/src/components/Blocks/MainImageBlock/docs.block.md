---
block: mainImageBlock
---

Shows the preview image of the content item as the main image of the page, with an optional title, description and link.

The block offers the image of the content item, so it stores no image. It is offered only on content items that have a `preview_image_link` property.

### Fields

- `title`: a heading shown above the image.
- `description`: text shown below the image.
- `altText`: the text that describes the image for screen readers. Leave it empty when the image is decorative.
- `align`: `left`, `center`, `right` or `full`. When the key is missing, the block aligns the image to the center, which is also the sidebar default.
- `size`: `s`, `m` or `l`. When the key is missing, the block renders the image at medium size (`m`). The sidebar default is `l`, so opening a block that misses this key stores `l` and changes its size. Store the key when a different size is intended.
- `styles`: the styling options of the block, such as the block width, stored as an object.
- `theme`: the background color of the block, chosen from the theme colors of the site.
- `href`: the link target, as a list with one `{ "@id": path }` object.
- `openLinkInNewTab`: `true` opens the link in a new tab. When the key is missing, the link opens in the same tab.

### Examples

```json
{ "@type": "mainImageBlock" }
```

```json
{
  "@type": "mainImageBlock",
  "title": "Welcome",
  "description": "A short text shown below the image.",
  "altText": "A group of people at a conference table",
  "align": "center",
  "size": "l",
  "styles": {},
  "theme": "default",
  "href": [{ "@id": "/path/to/item" }],
  "openLinkInNewTab": false
}
```

---
block: heroBlock
---

Highlights one content item at the top of a page, with a title, a description, an image and buttons. It has two variations: `flex`, which places the text and the image side by side, and `card`, which shows them in an attached card.

By default the block takes its title, description and image from the highlighted item. Set `overwrite` to store its own values instead.

### Fields

- `overwrite`: `true` uses the stored `title`, `description` and image instead of the ones of the highlighted item. When the key is missing, the block uses the highlighted item.
- `headerText`: small text shown above the title.
- `showDate`: `true` shows the date of the highlighted item. When the key is missing, the date is shown.
- `title`: the main title. It is used only when `overwrite` is `true`.
- `description`: the text below the title. It is used only when `overwrite` is `true`.
- `footerText`: additional text shown at the foot of the block.
- `tags`: a list of tags shown on the block.
- `fileType`: the type of the content, such as PDF, report or article.
- `preview_image`: the image stored with the block. It is used only when `overwrite` is `true`.
- `hideImage`: `true` hides the image. When the key is missing, the image is shown.
- `imageFit`: `cover` fills the image area and crops the edges of the image. `contain` fits the whole image and may leave empty bands. When the key is missing, the block uses `cover`.
- `buttons`: a list of buttons. Each button has a `buttonText` and a `buttonLink`, a list with one `{ "@id": path }` object. A button without a link goes to the highlighted item.
- `fullWidth`: `true` lets the text span the whole block when there is no image to show. When the key is missing, the text does not span the block.
- `blockWidth`: the width of the block, such as `layout`. When the key is missing, the block uses `layout`.
- `imageSize`: the width reserved for the image, as a percentage, even when there is no image. It sets the space left for the text. When the key is missing, the block uses `50%`.
- `titleTag`: the HTML element of the title: `h1`, `h2`, `h3` or `p`. When the key is missing, the block uses `h2`.
- `fullWidthImage`: `true` lets the image touch the edges of the block. It applies to the `flex` variation only.
- `textSide`: `left` or `right`, the side of the text. When the key is missing, the text is on the left.
- `href`: the highlighted content item, as a list with one `{ "@id": path }` object.
- `styles`: the styling options of the block, stored as an object.
- `theme`: the background color of the block, chosen from the theme colors of the site.

### Examples

```json
{ "@type": "heroBlock" }
```

```json
{
  "@type": "heroBlock",
  "variation": "flex",
  "href": [{ "@id": "/path/to/item" }]
}
```

```json
{
  "@type": "heroBlock",
  "variation": "card",
  "overwrite": true,
  "headerText": "Report",
  "showDate": true,
  "preview_image": [{ "@id": "/path/to/image" }],
  "styles": {},
  "title": "Annual report",
  "description": "The main results of the year.",
  "footerText": "Published by the communication team.",
  "tags": ["report"],
  "fileType": "PDF",
  "hideImage": false,
  "imageFit": "contain",
  "buttons": [
    { "buttonText": "Read more", "buttonLink": [{ "@id": "/path/to/item" }] }
  ],
  "fullWidth": false,
  "blockWidth": "layout",
  "imageSize": "40%",
  "titleTag": "h2",
  "fullWidthImage": false,
  "textSide": "left",
  "theme": "default"
}
```

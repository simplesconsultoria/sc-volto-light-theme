---
block: documentByline
---

Shows the publication date, the last modification date and the author of the content item, as a short line of metadata.

The block stores only which of these details to show. It reads their values from the content item when it renders, so to change the values, change the content item.

### Fields

- `showPublished`: `true` shows the publication date of the content item. When the key is missing, the block hides the publication date. The sidebar default is `true`, so a block created in the editor stores it.
- `showModified`: `true` shows the last modification date. When the key is missing, the block hides it. The sidebar default is `true`.
- `showAuthor`: `true` shows the author of the content item. When the key is missing, the block hides the author. The sidebar default is `false`.
- `styles`: the styling options of the block, as an object. `blockWidth:noprefix` sets the width of the block: `narrow`, `default`, `layout` or `full`. When it is missing, the block uses `default`. An older block may store the width as a top-level `blockWidth` instead, which is still read. `--cardBorderColor` and `--cardBorderWidth` add a border: a CSS colour and a CSS `border-width`, such as `2px` on every side or `0px 0px 3px 0px` for the bottom only. When they are missing, the block has no border.
- `theme`: the block theme, which sets the colours of the block and of the cards in it: `default`, `alternative`, another block theme of the site theme, or `custom-<back>-<front>` to pair two Color Groups, such as `custom-secondary-accent`. When the key is missing, the block uses `default`. The older `brand` is read as `alternative`.

A block that was written through the REST API, or saved before the defaults existed, may miss these keys. Opening it in the sidebar stores the defaults, and the block then shows the dates as the sidebar shows them.

### Examples

```json
{ "@type": "documentByline" }
```

```json
{
  "@type": "documentByline",
  "showPublished": true,
  "showModified": true,
  "showAuthor": false,
  "styles": { "blockWidth:noprefix": "narrow" },
  "theme": "default"
}
```

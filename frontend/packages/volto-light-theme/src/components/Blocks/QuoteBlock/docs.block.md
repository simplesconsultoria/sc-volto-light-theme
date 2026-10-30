---
block: quoteBlock
---

Shows a quotation, written as rich text, with an optional author or source line below it.

### Fields

- `author`: the name of the author or the source of the quotation, shown below the text. When it is empty, no line is shown.
- `backgroundStyle`: `transparent` or `filled`. When the key is missing, the block is transparent, which is also the sidebar default.
- `styles`: the styling options of the block, stored as an object.
- `theme`: the background color of the block, chosen from the theme colors of the site.

### Examples

```json
{ "@type": "quoteBlock" }
```

```json
{
  "@type": "quoteBlock",
  "author": "A person who said it",
  "backgroundStyle": "filled",
  "styles": {},
  "theme": "default"
}
```

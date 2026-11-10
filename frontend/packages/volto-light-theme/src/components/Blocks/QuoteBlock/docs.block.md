---
block: quoteBlock
---

Shows a quotation, written as rich text, with an optional author or source line below it.

### Fields

- `author`: the name of the author or the source of the quotation, shown below the text. When it is empty, no line is shown.
- `backgroundStyle`: `transparent` or `filled`. When the key is missing, the block is transparent, which is also the sidebar default.
- `styles`: the styling options of the block, as an object. `blockWidth:noprefix` sets the width of the block: `narrow`, `default`, `layout` or `full`. When it is missing, the block uses `default`. An older block may store the width as a top-level `blockWidth` instead, which is still read. `--cardBorderColor` and `--cardBorderWidth` add a border: a CSS colour and a CSS `border-width`, such as `2px` on every side or `0px 0px 3px 0px` for the bottom only. When they are missing, the block has no border.
- `theme`: the block theme, which sets the colours of the block and of the cards in it: `default`, `alternative`, another block theme of the site theme, or `custom-<back>-<front>` to pair two Color Groups, such as `custom-secondary-accent`. When the key is missing, the block uses `default`. The older `brand` is read as `alternative`.

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

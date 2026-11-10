---
block: customGrid
---

Shows a grid of columns, each holding its own blocks. The layout sets the proportions of the columns, such as 50 / 50 or 33 / 66.

The blocks inside the columns are stored with this block, in the data of each column. The schema covers only the title, the layout and the width.

### Fields

- `title`: a title shown above the grid.
- `layout`: the proportions of the columns, one of the values listed in the schema, such as `1-1` for two equal columns, `1-2` for a third and two thirds, or `1-1-1` for three equal columns. When the key is missing, the block uses `1-1`, which is also the sidebar default.
- `styles`: the styling options of the block, as an object. `blockWidth:noprefix` sets the width of the block: `narrow`, `default`, `layout` or `full`. When it is missing, the block uses `layout`. An older block may store the width as a top-level `blockWidth` instead, which is still read. `--cardBorderColor` and `--cardBorderWidth` add a border: a CSS colour and a CSS `border-width`, such as `2px` on every side or `0px 0px 3px 0px` for the bottom only. When they are missing, the block has no border.
- `theme`: the block theme, which sets the colours of the block and of the cards in it: `default`, `alternative`, another block theme of the site theme, or `custom-<back>-<front>` to pair two Color Groups, such as `custom-secondary-accent`. When the key is missing, the block uses `default`. The older `brand` is read as `alternative`.

### Examples

```json
{ "@type": "customGrid" }
```

```json
{
  "@type": "customGrid",
  "title": "Highlights",
  "layout": "1-2",
  "styles": { "blockWidth:noprefix": "layout" },
  "theme": "alternative"
}
```

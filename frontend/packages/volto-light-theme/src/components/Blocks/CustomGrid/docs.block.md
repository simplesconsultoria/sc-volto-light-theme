---
block: customGrid
---

Shows a grid of columns, each holding its own blocks. The layout sets the proportions of the columns, such as 50 / 50 or 33 / 66.

The blocks inside the columns are stored with this block, in the data of each column. The schema covers only the title, the layout and the width.

### Fields

- `title`: a title shown above the grid.
- `layout`: the proportions of the columns, one of the values listed in the schema, such as `1-1` for two equal columns, `1-2` for a third and two thirds, or `1-1-1` for three equal columns. When the key is missing, the block uses `1-1`, which is also the sidebar default.
- `blockWidth`: the width of the block, such as `layout`. When the key is missing, the block uses `layout`.

### Examples

```json
{ "@type": "customGrid" }
```

```json
{
  "@type": "customGrid",
  "title": "Highlights",
  "layout": "1-2",
  "blockWidth": "layout"
}
```

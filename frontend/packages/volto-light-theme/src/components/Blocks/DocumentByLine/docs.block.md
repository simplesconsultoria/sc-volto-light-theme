---
block: documentByline
---

Shows the publication date, the last modification date and the author of the content item, as a short line of metadata.

The block stores only which of these details to show. It reads their values from the content item when it renders, so to change the values, change the content item.

### Fields

- `showPublished`: `true` shows the publication date of the content item. When the key is missing, the block hides the publication date. The sidebar default is `true`, so a block created in the editor stores it.
- `showModified`: `true` shows the last modification date. When the key is missing, the block hides it. The sidebar default is `true`.
- `showAuthor`: `true` shows the author of the content item. When the key is missing, the block hides the author. The sidebar default is `false`.

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
  "showAuthor": false
}
```

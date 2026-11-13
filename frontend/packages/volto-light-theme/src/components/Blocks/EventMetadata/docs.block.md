---
block: eventMetadata
---

Shows the details of an event in a card: its date, location, link, contact and price. The details are read from the event when the block renders, so to change them, change the event.

The fields below override the event's own values. Leave a field empty to show the value of the event.

### Fields

- `location`: the place of the event. When it is empty, the block shows the location of the event, or a placeholder when the event has none.
- `eventUrl`: the link to the event, such as a registration page.
- `eventUrlLabel`: the text of the link to `eventUrl`.
- `contactName`: the name of the person to contact about the event.
- `contactEmail`: the email address to contact about the event.
- `price`: the price or the participation rule, such as "free" or "paid". When it is empty, the block shows the price of the event, or "free" when the event has none.
- `theme`: the block theme, which sets the colours of the block and of the cards in it: `default`, `alternative`, another block theme of the site theme, or `custom-<back>-<front>` to pair two Color Groups, such as `custom-secondary-accent`. When the key is missing, the block uses `default`. The older `brand` is read as `alternative`.
- `styles`: the styling options of the block, as an object. `blockWidth:noprefix` sets the width of the block: `narrow`, `default`, `layout` or `full`. When it is missing, the block uses `default`. An older block may store the width as a top-level `blockWidth` instead, which is still read. `--cardBorderColor` and `--cardBorderWidth` add a border: a CSS colour and a CSS `border-width`, such as `2px` on every side or `0px 0px 3px 0px` for the bottom only. When they are missing, the block has no border.

### Examples

```json
{ "@type": "eventMetadata" }
```

```json
{
  "@type": "eventMetadata",
  "location": "Main hall",
  "eventUrl": "https://example.org/register",
  "eventUrlLabel": "Register",
  "contactName": "Event office",
  "contactEmail": "events@example.org",
  "price": "Free",
  "styles": { "blockWidth:noprefix": "default", "--cardBorderWidth": "1px" },
  "theme": "custom-secondary-accent"
}
```

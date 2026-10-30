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
- `blockWidth`: the width of the block, such as `layout`. When the key is missing, the block uses `layout`.
- `theme`: the color of the card, chosen from the theme colors of the site. When the key is missing, the block uses `slate`, which is also the sidebar default.

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
  "blockWidth": "layout",
  "theme": "slate"
}
```

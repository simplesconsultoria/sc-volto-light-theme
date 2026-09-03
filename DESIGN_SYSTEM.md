# Design System

The design system for `@simplesconsultoria/volto-light-theme` is documented under
[`docs/design-system/`](./docs/design-system/).

| document | contents |
|---|---|
| [DESIGN_SYSTEM.md](./docs/design-system/DESIGN_SYSTEM.md) | the manifest — what the add-on owns, what it inherits, and the rules that govern how they compose |
| [INVENTORY.md](./docs/design-system/INVENTORY.md) | exhaustive tables: block schemas, listing variations, all custom properties with resolved light/dark values, the type scale |
| [GAPS.md](./docs/design-system/GAPS.md) | verified defects, a WCAG contrast audit of the shipped palette, and the open design decisions |
| [previews/](./docs/design-system/previews/) | self-contained preview pages, marked up for import into Claude Design |

The most current answer to "what blocks exist" is not in any of these — it is the
`Public/Blocks/Inventory` story, which reads the block registry at runtime.

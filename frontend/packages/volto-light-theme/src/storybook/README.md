# Storybook

Stories and harness code for components this package **does not ship**.

The rule, so a story is always where you would look for it:

| the story covers | it lives |
|---|---|
| a component this package ships | beside the component |
| a component from a dependency, or nothing in particular | here |

`Blocks/HeroBlock/HeroBlock.stories.tsx` sits next to the block it documents. `gridBlock`
belongs to Volto core and `separator` to `@kitconcept/volto-separator-block`, so their
stories are here — putting them under `components/Blocks/` would imply this package owns
them.

## Contents

| file | covers |
|---|---|
| `withTheme.tsx` | the decorator every story renders through: colour mode, block theme, site theme, and the centred container |
| `BlocksInventory.stories.tsx` | every block registered at runtime, whichever layer supplies it |
| `BlocksGallery.stories.tsx` | each of those blocks rendered through `RenderBlocks` |
| `DefaultView.stories.tsx` | Volto's `DefaultView` — a Document, a News Item and an Event |
| `GridBlock.stories.tsx` | core's `gridBlock` at one to four columns |
| `Separator.stories.tsx` | the separator block's width, short-line and alignment controls |
| `galleryFixtures.ts` | sample block data and the content object the gallery renders against |
| `viewFixtures.ts` | the page-level content objects |

Fixtures for components this package *does* ship stay next to them —
`components/Blocks/Listing/fixtures.ts` and
`components/Controlpanels/Themes/fixtures.ts` — for the same reason.

## Two things that catch people out

**A component's stylesheet is usually scoped to an ancestor**, and outside it the
component renders unstyled while looking like broken CSS. `_listing.scss` needs
`body .block.listing`, `_navigation.scss` needs `#navigation.navigation.scNavigation`,
and a themed block needs a wrapper supplying `--theme-*`. `docs/design-system/DESIGN_SYSTEM.md` §7 lists the cases.

**`RenderBlocks` has its own per-block error boundary**, and it is the inner one — a
failing block shows "Block error: …" rather than reaching a boundary a story adds. When
auditing the gallery, search for that string.

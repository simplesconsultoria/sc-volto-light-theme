"""Generate JS twins for Volto's SVG icons, for bundlers that aren't webpack.

Volto's `Icon` component reads `name.attributes.viewBox` and `name.content` — the shape
`svg-loader` produces from an `.svg` import under webpack. The design-system converter
bundles with esbuild, whose loader map hardcodes `.svg` to `dataurl`, so `Icon` receives a
string, renders nothing, and its button collapses to an empty box.

This writes a `<name>.svg.js` beside nothing at all — into a generated directory the
overlay points `@plone/volto/icons` at. esbuild falls back to `<path>.js` when the exact
file is absent, so `import clearSVG from '@plone/volto/icons/clear.svg'` resolves here.
The generated directory deliberately does NOT contain the `.svg` files themselves: if it
did, esbuild would find them first and apply the dataurl loader again.

The parsing mirrors `svg-loader@0.0.2/index.js` statement for statement, so the previews
get exactly what the storybook renders.
"""

from __future__ import annotations

import json
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
# (source directory, generated directory). Volto's icons are reached as
# `@plone/volto/icons/*.svg`; ours as `@simplesconsultoria/volto-light-theme/icons/*.svg`
# — both are package-absolute, which is what lets the overlay reroute them. A relative
# `../../icons/x.svg` resolves straight to the real file and cannot be intercepted.
SOURCES = [
    (
        ROOT / "frontend/core/packages/volto/src/icons",
        ROOT / ".design-sync/.cache/volto-icons",
    ),
    (
        ROOT / "frontend/packages/volto-light-theme/src/icons",
        ROOT / ".design-sync/.cache/sc-icons",
    ),
]

SVG_RE = re.compile(r"<svg([^>]+)+>([\s\S]+)</svg>", re.I)
ATTR_RE = re.compile(r"""([\w\-:]+)(=)?("[^<>"]*"|'[^<>']*'|[\w\-:]+)""")


def parse(svg: str) -> dict:
    """Extract the root attributes and inner markup, as `svg-loader` does.

    :param svg: the raw contents of an `.svg` file.
    :returns: the ``{"attributes": ..., "content": ...}`` object `Icon` consumes.
    """
    match = SVG_RE.search(svg)
    if not match:
        return {"attributes": {}, "content": ""}

    attributes: dict[str, object] = {}
    for attr in ATTR_RE.findall(match.group(1) or ""):
        name, _, value = attr
        attributes[name] = value.strip("'\"") if value else True

    content = re.sub(r"\n", " ", match.group(2) or "").strip()
    return {"attributes": attributes, "content": content}


def main() -> None:
    for src, out in SOURCES:
        assert src.is_dir(), f"icons not found at {src}"
        if out.exists():
            shutil.rmtree(out)
        out.mkdir(parents=True)

        written = 0
        empty = []
        for svg in sorted(src.glob("*.svg")):
            payload = parse(svg.read_text(encoding="utf-8"))
            if not payload["content"]:
                empty.append(svg.name)
            (out / f"{svg.name}.js").write_text(
                f"export default {json.dumps(payload)};\n", encoding="utf-8"
            )
            written += 1

        print(f"wrote {written} icon modules to {out.relative_to(ROOT)}")
        if empty:
            print(f"  ! parsed no content for: {', '.join(empty)}")


if __name__ == "__main__":
    main()

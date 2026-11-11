"""Generate JS twins for Volto and addon SVG icons, for bundlers that aren't webpack.

Volto's `Icon` component reads `name.attributes.viewBox` and `name.content` — the shape
`svg-loader` produces from an `.svg` import under webpack. The design-system converter
bundles with esbuild, whose loader map hardcodes `.svg` to `dataurl`, so `Icon` receives a
string, renders nothing, and its button collapses to an empty box.

This writes a `<name>.svg.js` beside nothing at all — into generated directories the
overlay points `@plone/volto/icons`, `@kitconcept/volto-light-theme/icons`,
`@plonegovbr/volto-social-media/icons`, and `@simplesconsultoria/volto-light-theme/icons`
at. esbuild falls back to `<path>.js` when the exact `.svg` file is absent, so SVG imports
for `<Icon>` components resolve cleanly. The generated directories deliberately contain NO
raw `.svg` files: if they did, esbuild would pick them first as dataurl strings.

The parsing mirrors `svg-loader@0.0.2/index.js` statement for statement, so the previews
get exactly what the storybook renders.
"""

from __future__ import annotations

import json
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
PKG_REAL = ROOT / "frontend/packages/volto-light-theme"


def resolve_pkg(name: str) -> pathlib.Path | None:
    for base in (PKG_REAL / "node_modules", ROOT / "frontend/node_modules"):
        candidate = base / name
        if candidate.exists():
            return candidate.resolve()
    return None


VLT = resolve_pkg("@kitconcept/volto-light-theme")
SOCIAL_MEDIA = resolve_pkg("@plonegovbr/volto-social-media")

# (list_of_source_dirs_lowest_to_highest, generated_output_dir)
SOURCES: list[tuple[list[pathlib.Path], pathlib.Path]] = [
    (
        [
            ROOT / "frontend/core/packages/volto/src/icons",
            *([VLT / "src/customizations/volto/icons"] if VLT else []),
        ],
        ROOT / ".design-sync/.cache/volto-icons",
    ),
    (
        [PKG_REAL / "src/icons"],
        ROOT / ".design-sync/.cache/sc-icons",
    ),
    *(
        [([VLT / "src/icons"], ROOT / ".design-sync/.cache/vlt-icons")]
        if VLT
        else []
    ),
    *(
        [([SOCIAL_MEDIA / "src/icons"], ROOT / ".design-sync/.cache/sm-icons")]
        if SOCIAL_MEDIA
        else []
    ),
]

SVG_RE = re.compile(r"<svg([^>]+)+>([\s\S]+)</svg>", re.I)
ATTR_RE = re.compile(r"""([\w\-:]+)(=)?("[^<>"]*"|'[^<>']*'|[\w\-:]+)""")


def parse(svg: str) -> dict:
    """Extract the root attributes and inner markup, as `svg-loader` does."""
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
    for src_dirs, out in SOURCES:
        existing = [d for d in src_dirs if d.is_dir()]
        if not existing:
            continue
        if out.exists():
            shutil.rmtree(out)
        out.mkdir(parents=True)

        written = 0
        empty: list[str] = []
        seen: set[str] = set()
        for src in existing:
            for svg in sorted(src.glob("*.svg")):
                payload = parse(svg.read_text(encoding="utf-8"))
                if not payload["content"]:
                    empty.append(svg.name)
                (out / f"{svg.name}.js").write_text(
                    f"export default {json.dumps(payload)};\n", encoding="utf-8"
                )
                if svg.name not in seen:
                    written += 1
                    seen.add(svg.name)

        print(f"wrote {written} icon modules to {out.relative_to(ROOT)}")
        if empty:
            print(f"  ! parsed no content for: {', '.join(empty)}")


if __name__ == "__main__":
    main()

"""Build a synthetic node_modules that encodes Volto's webpack alias scheme.

Volto's RelativeResolverPlugin rewrites `@plone/volto/X` to `@plone/volto/src/X` at
build time, and does the same for every Volto addon. esbuild can't do that, so this
overlay:
1. Points `@plone/volto`, `@plone/volto-slate`, `@kitconcept/volto-light-theme`, and
   every declared addon at its `src/` tree.
2. Mirrors addon source packages so relative imports stay inside the overlay rather than
   escaping through pnpm symlinks, while stripping bare `.less`/`.scss` side-effect
   imports (CSS is compiled separately by `build-css.sh`).
3. Layers `src/customizations/` from addons (lowest to highest) and SC-VLT (highest),
   rewriting bridge relative imports inside customizations to package-absolute paths so
   upstream bridges respect downstream shadows.
4. Patches the few core `@plone/volto` files whose relative `./` imports target a
   customized module (e.g. Teaser `View.jsx -> ./Body`) so they route through `@plone/volto/`.
5. Exposes `@root/reducers` and a `globalThis`-memoised `@plone/registry` singleton so
   the converter bundle and standalone story previews share one populated `config`.
"""

from __future__ import annotations

import json
import os
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
OVERLAY = ROOT / ".design-sync/nm-overlay"
CACHE = ROOT / ".design-sync/.cache"
PKG = "@simplesconsultoria/volto-light-theme"
PKG_REAL = ROOT / "frontend/packages/volto-light-theme"
SOURCES = [
    PKG_REAL / "node_modules",
    ROOT / "frontend/node_modules",
    # Volto's src imports its own deps (react-redux, semantic-ui-react, ...)
    # from here, not from the app's node_modules.
    ROOT / "frontend/core/packages/volto/node_modules",
]

CODE_SUFFIXES = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"}
TEST_MARKERS = (".test.", ".spec.", ".stories.")
# Match bare side-effect imports of .less / .scss files only.
STYLE_IMPORT_RE = re.compile(
    r"""^[ \t]*import\s+['"][^'"]+\.(?:less|scss)(?:\?[^'"]*)?['"];?[ \t]*$""",
    re.MULTILINE,
)
REL_IMPORT_RE = re.compile(
    r"""(\bfrom\s*['"]|\bimport\s*['"])(\.[^'"]+)(['"])"""
)

pkg_manifest = json.loads((PKG_REAL / "package.json").read_text())


def resolve_pkg_root(name: str) -> pathlib.Path | None:
    for base in (PKG_REAL / "node_modules", ROOT / "frontend/node_modules"):
        candidate = base / name
        if candidate.exists():
            return candidate.resolve()
    return None


def resolve_addon_src(name: str) -> pathlib.Path | None:
    pkg_dir = resolve_pkg_root(name)
    if pkg_dir and (pkg_dir / "src").is_dir():
        return pkg_dir / "src"
    return None


ALIASES: dict[str, pathlib.Path] = {
    "@plone/volto": ROOT / "frontend/core/packages/volto/src",
    "@plone/volto-slate": ROOT / "frontend/core/packages/volto-slate/src",
}

vlt_src = resolve_addon_src("@kitconcept/volto-light-theme")
assert vlt_src, "kitconcept VLT src not found in node_modules"
ALIASES["@kitconcept/volto-light-theme"] = vlt_src

ADDON_SRCS: list[tuple[str, pathlib.Path]] = []
for addon_name in pkg_manifest.get("addons", []):
    if addon_name == PKG:
        continue
    src_dir = resolve_addon_src(addon_name)
    if src_dir:
        ADDON_SRCS.append((addon_name, src_dir))
        if addon_name not in ALIASES:
            ALIASES[addon_name] = src_dir

for target in ALIASES.values():
    assert target.is_dir(), f"alias target missing: {target}"


def remove_entry(path: pathlib.Path) -> None:
    if path.is_symlink() or path.is_file():
        path.unlink()
    elif path.is_dir():
        shutil.rmtree(path)


def split_parent_symlinks(target_rel: pathlib.Path) -> None:
    """Ensure every parent directory of `OVERLAY / target_rel` is a real directory."""
    cur = OVERLAY
    for segment in target_rel.parts[:-1]:
        cur = cur / segment
        if cur.is_symlink():
            real_dir = cur.resolve()
            cur.unlink()
            cur.mkdir(parents=True, exist_ok=True)
            if real_dir.is_dir():
                for child in sorted(real_dir.iterdir()):
                    (cur / child.name).symlink_to(child.resolve())
        elif not cur.exists():
            cur.mkdir(parents=True, exist_ok=True)


def strip_style_imports(text: str) -> str:
    return STYLE_IMPORT_RE.sub(
        lambda m: f"// [ds-overlay stripped] {m.group(0).strip()}",
        text,
    )


def rewrite_relative_imports(
    text: str,
    file_in_src: pathlib.Path,
    src_root: pathlib.Path,
    pkg_name: str,
    exclude_subpath: str | None = None,
) -> str:
    """Rewrite relative imports targeting inside `src_root` to package-absolute paths."""
    src_root = src_root.resolve()

    def repl(match: re.Match[str]) -> str:
        prefix, rel_imp, quote = match.groups()
        resolved = (file_in_src.parent / rel_imp).resolve()
        try:
            rel_target = resolved.relative_to(src_root)
        except ValueError:
            return match.group(0)
        rel_str = rel_target.as_posix()
        if exclude_subpath and (
            rel_str == exclude_subpath or rel_str.startswith(exclude_subpath + "/")
        ):
            return match.group(0)
        if not rel_str or rel_str == ".":
            return match.group(0)
        return f"{prefix}{pkg_name}/{rel_str}{quote}"

    return REL_IMPORT_RE.sub(repl, text)


def mirror_package_src(
    pkg_name: str,
    src_dir: pathlib.Path,
    strip_styles: bool = True,
    icons_cache: pathlib.Path | None = None,
) -> int:
    """Materialize a package's `src/` inside OVERLAY so relative imports stay in the overlay."""
    dest_root = OVERLAY / pkg_name
    remove_entry(dest_root)
    dest_root.mkdir(parents=True)
    src_dir = src_dir.resolve()
    copied = 0

    for root_str, dirnames, filenames in os.walk(src_dir):
        cur_src = pathlib.Path(root_str)
        rel_dir = cur_src.relative_to(src_dir)

        # Skip customizations (layered separately) and replace icons dir when requested.
        if rel_dir == pathlib.Path("."):
            if "customizations" in dirnames:
                dirnames.remove("customizations")
            if icons_cache and icons_cache.is_dir() and "icons" in dirnames:
                dirnames.remove("icons")
                (dest_root / "icons").symlink_to(icons_cache.resolve())

        dest_dir = dest_root / rel_dir
        dest_dir.mkdir(parents=True, exist_ok=True)

        for fname in filenames:
            src_file = cur_src / fname
            dest_file = dest_dir / fname
            if (
                src_file.suffix in CODE_SUFFIXES
                and not any(m in fname for m in TEST_MARKERS)
            ):
                txt = src_file.read_text(encoding="utf-8")
                if strip_styles:
                    txt = strip_style_imports(txt)
                dest_file.write_text(txt, encoding="utf-8")
                copied += 1
            else:
                dest_file.symlink_to(src_file)
    return copied


def overlay_customizations(
    custom_root: pathlib.Path,
    owner_pkg: str,
    owner_src: pathlib.Path,
) -> tuple[int, list[pathlib.Path]]:
    """Shadow files in nm-overlay with `custom_root`, rewriting bridge relative imports."""
    applied = 0
    volto_targets: list[pathlib.Path] = []
    if not custom_root.is_dir():
        return applied, volto_targets

    for item in sorted(custom_root.rglob("*")):
        if not item.is_file():
            continue
        rel = item.relative_to(custom_root)
        parts = rel.parts

        # Skip webpack CSS escape hatch and Volto SVG icon overrides (handled as .svg.js twins).
        if parts[0] == "@root":
            continue
        if parts[0] == "volto" and len(parts) >= 2 and parts[1] == "icons" and item.suffix == ".svg":
            continue

        if parts[0] == "volto":
            target_rel = pathlib.Path("@plone/volto").joinpath(*parts[1:])
            volto_targets.append(pathlib.Path(*parts[1:]))
        else:
            target_rel = rel

        split_parent_symlinks(target_rel)
        dest = OVERLAY / target_rel
        remove_entry(dest)

        if item.suffix in CODE_SUFFIXES and not any(m in item.name for m in TEST_MARKERS):
            txt = item.read_text(encoding="utf-8")
            txt = strip_style_imports(txt)
            # Rewrite bridge relative imports pointing outside customizations back to owner_pkg/src.
            txt = rewrite_relative_imports(
                txt,
                item.resolve(),
                owner_src,
                owner_pkg,
                exclude_subpath="customizations",
            )
            dest.write_text(txt, encoding="utf-8")
        else:
            dest.symlink_to(item.resolve())
        applied += 1

    return applied, volto_targets


def patch_volto_relative_importers(
    volto_src: pathlib.Path,
    shadowed_volto_relpaths: list[pathlib.Path],
) -> int:
    """Copy & rewrite core Volto files whose `./` imports hit customized Volto modules."""
    volto_src = volto_src.resolve()
    shadowed_stems = {p.with_suffix("").as_posix() for p in shadowed_volto_relpaths}
    patched = 0

    for f in sorted(volto_src.rglob("*")):
        if (
            not f.is_file()
            or f.suffix not in CODE_SUFFIXES
            or any(m in f.name for m in TEST_MARKERS)
        ):
            continue
        txt = f.read_text(encoding="utf-8", errors="ignore")
        needs_patch = False
        for m in REL_IMPORT_RE.finditer(txt):
            resolved = (f.parent / m.group(2)).resolve()
            try:
                stem = resolved.relative_to(volto_src).with_suffix("").as_posix()
            except ValueError:
                continue
            if stem in shadowed_stems or any(stem == f"{s}/index" for s in shadowed_stems):
                needs_patch = True
                break
        if not needs_patch:
            continue

        rel = f.relative_to(volto_src)
        target_rel = pathlib.Path("@plone/volto") / rel
        split_parent_symlinks(target_rel)
        dest = OVERLAY / target_rel
        # Don't overwrite if this file itself was customized.
        if dest.exists(follow_symlinks=False) and not dest.is_symlink():
            continue
        remove_entry(dest)
        rewritten = rewrite_relative_imports(txt, f, volto_src, "@plone/volto")
        dest.write_text(rewritten, encoding="utf-8")
        patched += 1

    return patched


def main() -> None:
    if OVERLAY.exists():
        shutil.rmtree(OVERLAY)
    OVERLAY.mkdir(parents=True)

    linked = 0
    for src in SOURCES:
        if not src.is_dir():
            continue
        for entry in sorted(src.iterdir()):
            if entry.name.startswith(".") and entry.name != ".pnpm":
                continue
            if entry.name.startswith("@"):
                scope = OVERLAY / entry.name
                scope.mkdir(exist_ok=True)
                for pkg in sorted(entry.iterdir()):
                    dest = scope / pkg.name
                    if not dest.exists(follow_symlinks=False):
                        dest.symlink_to(pkg.resolve())
                        linked += 1
            else:
                dest = OVERLAY / entry.name
                if not dest.exists(follow_symlinks=False):
                    dest.symlink_to(entry.resolve())
                    linked += 1

    for name, target in ALIASES.items():
        dest = OVERLAY / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        remove_entry(dest)
        dest.symlink_to(target.resolve())

    # Materialize Volto as a directory so icons point to JS twins and customizations overlay cleanly.
    ICONS = CACHE / "volto-icons"
    volto_src = ALIASES["@plone/volto"].resolve()
    volto = OVERLAY / "@plone/volto"
    remove_entry(volto)
    volto.mkdir(parents=True)
    for child in sorted(volto_src.iterdir()):
        if child.name == "icons":
            continue
        (volto / child.name).symlink_to(child.resolve())
    if ICONS.is_dir():
        (volto / "icons").symlink_to(ICONS.resolve())
        print(f"@plone/volto/icons -> {len(list(ICONS.glob('*.js')))} generated icon modules")
    else:
        print("! .design-sync/.cache/volto-icons missing — run build-icons.py")

    # Mirror volto-slate and all declared addons (plus VLT) so relative imports resolve
    # within nm-overlay and bare .less/.scss imports don't block esbuild.
    ICON_CACHES = {
        "@kitconcept/volto-light-theme": CACHE / "vlt-icons",
        "@plonegovbr/volto-social-media": CACHE / "sm-icons",
    }
    mirrored_files = 0
    mirrored_files += mirror_package_src("@plone/volto-slate", ALIASES["@plone/volto-slate"])
    for addon_name, src_dir in ADDON_SRCS:
        mirrored_files += mirror_package_src(
            addon_name,
            src_dir,
            strip_styles=True,
            icons_cache=ICON_CACHES.get(addon_name),
        )
    print(f"mirrored {mirrored_files} addon/slate source files (style side-effects stripped)")

    # Layer customizations in Volto precedence order: addons first, SC-VLT last.
    all_volto_shadows: list[pathlib.Path] = []
    total_customs = 0
    for addon_name, src_dir in ADDON_SRCS:
        cnt, v_shadows = overlay_customizations(src_dir / "customizations", addon_name, src_dir)
        total_customs += cnt
        all_volto_shadows.extend(v_shadows)
        if cnt:
            print(f"customizations [{addon_name}]: {cnt} files")

    sc_cnt, sc_v_shadows = overlay_customizations(
        PKG_REAL / "src/customizations", PKG, PKG_REAL / "src"
    )
    total_customs += sc_cnt
    all_volto_shadows.extend(sc_v_shadows)
    print(f"customizations [{PKG}]: {sc_cnt} files (total {total_customs})")

    patched = patch_volto_relative_importers(volto_src, all_volto_shadows)
    print(f"patched {patched} core Volto relative importers to respect customizations")

    # @root/reducers alias target needed by `@plone/volto/store` (via `@plone/volto/storybook`).
    root_dir = OVERLAY / "@root"
    root_dir.mkdir(parents=True, exist_ok=True)
    (root_dir / "reducers.js").write_text(
        f"export {{ default }} from '{volto_src}/reducers/index.js';\n",
        encoding="utf-8",
    )

    # Curated synthetic package view for sc-vlt (`types` points at dsEntry.d.ts).
    view = OVERLAY / PKG
    remove_entry(view)
    view.mkdir(parents=True)
    (view / "package.json").write_text(
        json.dumps(
            {
                **pkg_manifest,
                "types": "dist/src/storybook/dsEntry.d.ts",
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    for child in ("src", "dist", "locales", "node_modules", "public"):
        target = PKG_REAL / child
        if target.exists():
            (view / child).symlink_to(target.resolve())

    sc_icons = CACHE / "sc-icons"
    if sc_icons.is_dir():
        (view / "icons").symlink_to(sc_icons.resolve())
    else:
        print("! .design-sync/.cache/sc-icons missing — run build-icons.py")

    # Memoised @plone/registry singleton on globalThis so bundle and previews share config.
    reg_real = ROOT / "frontend/core/packages/registry"
    reg = OVERLAY / "@plone/registry"
    remove_entry(reg)
    reg.mkdir(parents=True)
    (reg / "package.json").write_text(
        json.dumps(
            {
                "name": "@plone/registry",
                "version": "0.0.0-ds-shim",
                "main": "index.js",
                "module": "index.js",
                "types": f"{reg_real}/src/index.ts",
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    (reg / "index.js").write_text(
        f"import instance from '{reg_real}/src/index.ts';\n"
        f"export * from '{reg_real}/src/index.ts';\n"
        "const g = globalThis;\n"
        "if (!g.__dsPloneRegistry) g.__dsPloneRegistry = instance;\n"
        "export default g.__dsPloneRegistry;\n",
        encoding="utf-8",
    )
    for child in ("addon-registry", "src"):
        t = reg_real / child
        if t.exists():
            (reg / child).symlink_to(t.resolve())

    print(f"overlay ready: {linked} linked packages, {len(ALIASES)} aliased")
    checks = [
        "@plone/volto/components/theme/Icon/Icon.jsx",
        "@plone/volto/icons/clear.svg.js",
        "@plone/volto/icons/sort-down.svg.js",
        "@plone/volto/components/theme/View/RenderBlocks.jsx",
        "@plone/volto/components/manage/Blocks/Teaser/View.jsx",
        "@plone/volto/components/manage/Blocks/Listing/ListingBody.jsx",
        "@kitconcept/volto-light-theme/icons/left-key.svg.js",
        "@plonegovbr/volto-social-media/icons/facebook.svg.js",
        "@plone/registry/index.js",
        "@root/reducers.js",
        "@kitconcept/volto-light-theme/primitives/Card/Card.tsx",
        "@kitconcept/volto-light-theme/components/LogosContainer/LogosContainer.tsx",
        "@kitconcept/volto-slider-block/components/View.jsx",
        "@eeacms/volto-accordion-block/components/manage/Blocks/Accordion/View.jsx",
        "@plone/volto-slate/blocks/Text/TextBlockView.jsx",
    ]
    print("\nresolution probes:")
    for rel in checks:
        print(f"  {'ok  ' if (OVERLAY / rel).exists() else 'MISS'} {rel}")


if __name__ == "__main__":
    main()

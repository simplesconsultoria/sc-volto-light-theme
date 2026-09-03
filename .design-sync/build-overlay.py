"""Build a synthetic node_modules that encodes Volto's webpack alias scheme.

Volto's RelativeResolverPlugin rewrites `@plone/volto/X` to `@plone/volto/src/X` at
build time. esbuild can't do that, so the overlay points those two packages at their
`src/` directories and symlinks everything else through unchanged.
"""

import os
import pathlib
import shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
OVERLAY = ROOT / ".design-sync/nm-overlay"
SOURCES = [
    ROOT / "frontend/packages/volto-light-theme/node_modules",
    ROOT / "frontend/node_modules",
    # Volto's src imports its own deps (react-redux, semantic-ui-react, ...)
    # from here, not from the app's node_modules.
    ROOT / "frontend/core/packages/volto/node_modules",
]

# package name -> the directory it should really resolve to
ALIASES = {
    "@plone/volto": ROOT / "frontend/core/packages/volto/src",
    "@plone/volto-slate": ROOT / "frontend/core/packages/volto-slate/src",
}
kit = list((ROOT / "frontend/node_modules/.pnpm").glob(
    "@kitconcept+volto-light-theme@8.0.0-alpha.31*/node_modules/@kitconcept/volto-light-theme"
))
assert kit, "kitconcept VLT alpha.31 not found in the pnpm store"
ALIASES["@kitconcept/volto-light-theme"] = kit[0] / "src"

for target in ALIASES.values():
    assert target.is_dir(), f"alias target missing: {target}"

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

# apply the aliases last so they win over the plain symlinks above
for name, target in ALIASES.items():
    dest = OVERLAY / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists(follow_symlinks=False) or dest.is_symlink():
        dest.unlink()
    dest.symlink_to(target.resolve())

# @plone/volto becomes a real directory mirroring volto/src, so that `icons` can
# point at the generated JS twins instead of the .svg files. esbuild's loader map
# hardcodes .svg to dataurl, which makes Volto's Icon render nothing; the twins
# carry the {attributes, content} shape it actually reads. Run build-icons.py first.
ICONS = ROOT / ".design-sync/.cache/volto-icons"
if ICONS.is_dir():
    volto_src = ALIASES["@plone/volto"]
    volto = OVERLAY / "@plone/volto"
    if volto.is_symlink():
        volto.unlink()
    elif volto.exists():
        shutil.rmtree(volto)
    volto.mkdir(parents=True)
    for child in sorted(volto_src.iterdir()):
        if child.name == "icons":
            continue
        (volto / child.name).symlink_to(child.resolve())
    (volto / "icons").symlink_to(ICONS.resolve())
    print(f"@plone/volto/icons -> {len(list(ICONS.glob('*.js')))} generated icon modules")
else:
    print("! .design-sync/.cache/volto-icons missing — run build-icons.py; icons will render empty")

# The DS package itself gets a synthetic view rather than a plain symlink. The
# converter reads the component roster from the .d.ts the package's `types`
# field names, and the real package.json has none (it ships TS source, and its
# only export is `applyConfig`). Declaring `types` here points the converter at
# the curated design-system surface without touching the published manifest.
import json
PKG = "@simplesconsultoria/volto-light-theme"
PKG_REAL = ROOT / "frontend/packages/volto-light-theme"
view = OVERLAY / PKG
if view.is_symlink():
    view.unlink()
elif view.exists():
    shutil.rmtree(view)
view.mkdir(parents=True)
real_manifest = json.loads((PKG_REAL / "package.json").read_text())
(view / "package.json").write_text(json.dumps({
    **real_manifest,
    "types": "dist/src/storybook/dsEntry.d.ts",
}, indent=2) + "\n")
for child in ("src", "dist", "locales", "node_modules", "public"):
    target = PKG_REAL / child
    if target.exists():
        (view / child).symlink_to(target.resolve())

# Our own icons need the same JS twins as Volto's, for the same reason. Reached as
# `@simplesconsultoria/volto-light-theme/icons/<name>.svg`, which is why the two
# components using them import that form rather than a relative path.
SC_ICONS = ROOT / ".design-sync/.cache/sc-icons"
if SC_ICONS.is_dir():
    (view / "icons").symlink_to(SC_ICONS.resolve())
else:
    print("! .design-sync/.cache/sc-icons missing — run build-icons.py")
print(f"synthetic package view: {view.relative_to(ROOT)} (types -> dist/src/storybook/dsEntry.d.ts)")

# @plone/registry is a module-local singleton (`const instance = new Config()`),
# so the converter's bundle and each compiled preview would each get their OWN
# empty config — seeding one is invisible to the other, and components that read
# `config.settings` throw in the preview however well the bundle is set up. This
# shim memoises the instance on globalThis so every copy shares one.
REG_REAL = ROOT / "frontend/core/packages/registry"
reg = OVERLAY / "@plone/registry"
if reg.is_symlink():
    reg.unlink()
elif reg.exists():
    shutil.rmtree(reg)
reg.mkdir(parents=True)
(reg / "package.json").write_text(json.dumps({
    "name": "@plone/registry",
    "version": "0.0.0-ds-shim",
    "main": "index.js",
    "module": "index.js",
    "types": f"{REG_REAL}/src/index.ts",
}, indent=2) + "\n")
(reg / "index.js").write_text(
    f"import instance from '{REG_REAL}/src/index.ts';\n"
    f"export * from '{REG_REAL}/src/index.ts';\n"
    "const g = globalThis;\n"
    "if (!g.__dsPloneRegistry) g.__dsPloneRegistry = instance;\n"
    "export default g.__dsPloneRegistry;\n"
)
for child in ("addon-registry", "src"):
    t = REG_REAL / child
    if t.exists():
        (reg / child).symlink_to(t.resolve())
print("shimmed @plone/registry as a globalThis singleton")

print(f"overlay: {linked} packages linked, {len(ALIASES)} aliased")
for name in ALIASES:
    probe = OVERLAY / name
    # @plone/volto is a mirrored directory rather than a symlink (see the icons
    # reroute above), so report the target only when there is one to read.
    target = os.readlink(probe) if probe.is_symlink() else "(mirrored directory)"
    print(f"  {name} -> {target}")

# prove the alias actually resolves the paths esbuild failed on
checks = [
    "@plone/volto/components/theme/Icon/Icon.jsx",
    "@plone/volto/icons/clear.svg",
    "@plone/volto/registry.js",
    "@plone/volto/config.js",
    "@kitconcept/volto-light-theme/primitives/Card/Card.jsx",
]
print("\nresolution probes:")
for rel in checks:
    print(f"  {'ok  ' if (OVERLAY / rel).exists() else 'MISS'} {rel}")

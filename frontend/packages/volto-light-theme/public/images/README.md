# Public images

Served at the Storybook root by `staticDirs` in `frontend/.storybook/main.js`, and
shipped inside the npm package, so anything here reaches every project that installs
the add-on. Keep it to assets a *running site* needs.

**Story photographs do not belong here.** They live in `src/storybook/images/`, where
the fixtures `import` them: an import is inlined by webpack for Storybook and by
esbuild for the Claude Design export, so the previews work offline, and `.npmignore`
keeps the weight out of the published package. A file here would instead be fetched
by URL at view time — which resolves to nothing in a Claude Design preview.

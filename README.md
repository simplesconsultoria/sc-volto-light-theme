# Simples Consultoria VLT 🚀

[![Built with Cookieplone](https://img.shields.io/badge/built%20with-Cookieplone-0083be.svg?logo=cookiecutter)](https://github.com/plone/cookieplone-templates/)
[![Black code style](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![CI](https://github.com/simplesconsultoria/sc-volto-light-theme/actions/workflows/main.yml/badge.svg)](https://github.com/simplesconsultoria/sc-volto-light-theme/actions/workflows/main.yml)

Opinionated enhancements for @kitconcept/volto-light-theme

## Quick Start 🏁

### Prerequisites ✅

-   An [operating system](https://6.docs.plone.org/install/create-project-cookieplone.html#prerequisites-for-installation) that runs all the requirements mentioned.
-   [uv](https://6.docs.plone.org/install/create-project-cookieplone.html#uv)
-   [nvm](https://6.docs.plone.org/install/create-project-cookieplone.html#nvm)
-   [Node.js and pnpm](https://6.docs.plone.org/install/create-project.html#node-js) 24
-   [Make](https://6.docs.plone.org/install/create-project-cookieplone.html#make)
-   [Git](https://6.docs.plone.org/install/create-project-cookieplone.html#git)
-   [Docker](https://docs.docker.com/get-started/get-docker/) (optional)


### Installation 🔧

1.  Clone this repository, then change your working directory.

    ```shell
    git clone git@github.com:simplesconsultoria/sc-volto-light-theme.git
    cd sc-volto-light-theme
    ```

2.  Install this code base.

    ```shell
    make install
    ```


### Fire Up the Servers 🔥

1.  Create a new Plone site on your first run.

    ```shell
    make backend-create-site
    ```

2.  Start the backend at http://localhost:8080/.

    ```shell
    make backend-start
    ```

3.  In a new shell session, start the frontend at http://localhost:3000/.

    ```shell
    make frontend-start
    ```

Voila! Your Plone site should be live and kicking! 🎉

### Local Stack Deployment 📦

Deploy a local Docker Compose environment that includes the following.

- Docker images for Backend and Frontend 🖼️
- A stack with a Traefik router and a PostgreSQL database 🗃️
- Accessible at [http://sc-volto-light-theme.localhost](http://sc-volto-light-theme.localhost) 🌐

Run the following commands in a shell session.

```shell
make stack-create-site
make stack-start
```

And... you're all set! Your Plone site is up and running locally! 🚀

## Upgrading 🔄

### From 1.0.0a15 or earlier to 1.0.0a16 (new theme system)

1.0.0a16 replaces the 32 per-color fields of each theme with **Color Groups** and **Block Themes**, and gives every block **width** and **border** controls. Your content, your theme and your code keep working: bump the versions, run the upgrade step, and check the few changes listed under [What changes](#what-changes).

1.  **Bump the versions.**

    | Where | Package | Version |
    | --- | --- | --- |
    | Backend (`pyproject.toml`) | `sc-voltolighttheme` | `1.0.0a16` or later |
    | Backend (`pyproject.toml`) | `kitconcept.voltolighttheme` | `8.1.4` or later |
    | Frontend (`package.json`) | `@simplesconsultoria/volto-light-theme` | `1.0.0-alpha.16` or later |
    | Frontend (`mrs.developer.json`, `core`) | `@plone/volto` | tag `19.7.0` or later |

    After changing the Volto tag, keep `"webpack": "catalog:"` in `pnpm.overrides`, check that `pnpm-lock.yaml` resolves a single webpack version, and run `make storybook-build`.

2.  **Install.**

    ```shell
    make install
    ```

3.  **Run the upgrade step** (profile `1002`). It turns each theme's old colors into Color Groups.

    -   In the site: *Site Setup* → *Add-ons* → *Upgrade* next to *Simples Consultoria VLT: Install*.
    -   Or from your own policy package, in a new upgrade step:

        ```python
        def upgrade_sc_volto_light_theme(context):
            context.upgradeProfile("sc.voltolighttheme:default")
        ```

    Until it runs, the site already shows the right colors: they are derived from the old fields on every read.

4.  **Check** the *Themes* control panel: each theme shows its Color Groups, with the colors it had before.

#### What keeps working without changes

| You have | What happens |
| --- | --- |
| Themes stored with the old color fields (`primary_color_light`, `font_family_primary`, …) | Converted to Color Groups by the upgrade step; derived on read until then. |
| A `registry.xml` in your profile setting those fields on `ISCVLTThemeDefinition` | Still imports, on existing and new sites, including on the `default` theme: its colors replace the palette this add-on ships. They are stored as Color Groups the next time the theme is saved. |
| `font_family_secondary` and the event, file and image colors | Still stored and applied. They are not shown in the control panel form. |
| Blocks saved with the `brand` theme | Shown as `alternative`. |
| Blocks saved with plain VLT's `grey` theme | Shown as before, a grey band with white cards (`custom-secondary-primary`). A project that defines its own `grey` theme keeps it. |
| Block width stored in `data.blockWidth` or `styles.blockWidth` | Still read. New edits store it in `styles['blockWidth:noprefix']`. |
| CSS using `--primary-color`, `--secondary-color`, `--primary-foreground-color`, … | Still defined, now fed by the Color Groups. |
| Blocks from your own add-ons | Get the theme, width and border controls automatically, even when registered after this add-on. |

#### What changes

| Change | What to do |
| --- | --- |
| **New default palette.** Sites that never set their own colors change from black and orange to white and cool-gray surfaces with a light-blue accent (`#a5d8ff`), and the default font follows the primary Color Group. | Set your palette in your theme profile (see below) or in the *Themes* control panel. |
| **Theme REST data.** `@controlpanels/themes/<theme-id>` serves `color_groups` and `block_themes` instead of the per-color keys (`primary_color_light`, …), as soon as the new code is deployed. | Read `color_groups.<group>.<role>_color_<mode>`. The old keys are still accepted when writing. |
| **Color Group ids** use lowercase letters, digits and underscores (`my_brand`). | Nothing, unless a client creates groups through the API. |
| **No default social networks.** The footer shows the site's `social_links`, or nothing. | Set `config.settings.socialNetworks` in your project if it relied on a frontend list. |

#### Optional follow-ups

-   **Your own blocks:** theme colors and borders reach a block through the `className` and `style` props its view receives. Pass both to the block's root element:

    ```jsx
    <div className={`block my-block ${className}`} style={style}>
    ```

    To keep a block out of the border controls, add its id to `config.settings.borderExcludedBlocks` (default: `['separator']`).

-   **Your theme profile:** write the theme as Color Groups. Keep the interface `ISCVLTThemeDefinition`, which also accepts `font_family_secondary` and the event, file and image colors. The easiest way is to adjust the theme in the control panel of an upgraded site and copy the JSON served at `@controlpanels/themes/<theme-id>`:

    ```xml
    <records interface="sc.voltolighttheme.interfaces.ISCVLTThemeDefinition"
             prefix="sc.voltolighttheme.theme.default">
      <value key="name">My theme</value>
      <value key="color_groups">{"primary": {"id": "primary", "name": "Primary", "background_color_light": "#ffffff", …}, …}</value>
      <value key="block_themes">{"default": {"id": "default", "name": "Primary", "back_color_group": "primary", "front_color_group": "neutral"}, …}</value>
      <value key="font_family_secondary">Inter, sans-serif</value>
      <value key="event_color_light">#d32f2f</value>
    </records>
    ```

    The old fields map to Color Group keys like this, for the groups `primary`, `secondary`, `accent` and `neutral` and the modes `light` and `dark`:

    | Old field | Key in `color_groups.<group>` |
    | --- | --- |
    | `<group>_color_<mode>` | `background_color_<mode>` |
    | `<group>_foreground_color_<mode>` | `text_color_<mode>` |
    | `<group>_low_foreground_color_<mode>` | `subtext_color_<mode>` |
    | `<group>_accent_color_<mode>` | `accent_color_<mode>` |
    | `font_family_primary` | `font_family` of each group |

    Leave out `block_themes` to get the defaults, `default` and `alternative`. `profiles/initial/registry/sc.voltolighttheme.themes.xml` in this repository is a complete example.

## Project structure 🏗️

This monorepo consists of the following distinct sections:

- **backend**: Houses the API and Plone installation, utilizing pip instead of buildout, and includes a policy package named sc.voltolighttheme.
- **frontend**: Contains the React (Volto) package.
- **devops**: Encompasses Docker stack, Ansible playbooks, and cache settings.
- **docs**: Scaffold for writing documentation for your project.

### Why this structure? 🤔

- All necessary codebases to run the site are contained within the repository (excluding existing add-ons for Plone and React).
- Specific GitHub Workflows are triggered based on changes in each codebase (refer to .github/workflows).
- Simplifies the creation of Docker images for each codebase.
- Demonstrates Plone installation/setup without buildout.

## Code quality assurance 🧐

To check your code against quality standards, run the following shell command.

```shell
make check
```

### Format the codebase

To format and rewrite the code base, ensuring it adheres to quality standards, run the following shell command.

```shell
make format
```

| Section | Tool | Description | Configuration |
| --- | --- | --- | --- |
| backend | Ruff | Python code formatting, imports sorting  | [`backend/pyproject.toml`](./backend/pyproject.toml) |
| backend | `zpretty` | XML and ZCML formatting  | -- |
| frontend | ESLint | Fixes most common frontend issues | [`frontend/.eslintrc.js`](.frontend/.eslintrc.js) |
| frontend | prettier | Format JS and Typescript code  | [`frontend/.prettierrc`](.frontend/.prettierrc) |
| frontend | Stylelint | Format Styles (css, less, sass)  | [`frontend/.stylelintrc`](.frontend/.stylelintrc) |

Formatters can also be run within the `backend` or `frontend` folders.

### Linting the codebase
or `lint`:

 ```shell
make lint
```

| Section | Tool | Description | Configuration |
| --- | --- | --- | --- |
| backend | Ruff | Checks code formatting, imports sorting  | [`backend/pyproject.toml`](./backend/pyproject.toml) |
| backend | Pyroma | Checks Python package metadata  | -- |
| backend | check-python-versions | Checks Python version information  | -- |
| backend | `zpretty` | Checks XML and ZCML formatting  | -- |
| frontend | ESLint | Checks JS / Typescript lint | [`frontend/.eslintrc.js`](.frontend/.eslintrc.js) |
| frontend | prettier | Check JS / Typescript formatting  | [`frontend/.prettierrc`](.frontend/.prettierrc) |
| frontend | Stylelint | Check Styles (css, less, sass) formatting  | [`frontend/.stylelintrc`](.frontend/.stylelintrc) |

Linters can be run individually within the `backend` or `frontend` folders.

## Internationalization 🌐

Generate translation files for Plone and Volto with ease:

```shell
make i18n
```

## Credits and acknowledgements 🙏

Generated using [Cookieplone (2.0.0b3)](https://github.com/plone/cookieplone) and [cookieplone-templates (66a74c3)](https://github.com/plone/cookieplone-templates/commit/66a74c3744f84b177401b25836d3702c2ef1b5f3) on 2026-07-08 13:45:31.124592. A special thanks to all contributors and supporters!

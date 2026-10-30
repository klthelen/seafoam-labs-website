# Seafoam Labs

Website for Seafoam Labs, built with [Astro](https://github.com/withastro/astro) and
[Starlight](https://github.com/withastro/starlight).

## Requirements

- Node.js 24.x
- pnpm (pinned in `package.json`)

Keep the `packageManager` and `engines.pnpm` pins aligned. The deployment
buildpack passes `--prod=false` when installing dependencies; pnpm 12 releases
affected by [pnpm#14553](https://github.com/pnpm/pnpm/issues/14553) reject that
flag. Validate the buildpack install command before upgrading the pnpm pin.

## Changelog Rate Limits

Changelog pages are fetched from the GitHub API on every dev start, `astro check`, and build, so
the anonymous 60 requests per hour can run out and fail the build with `403 - rate limit
exceeded`. Export a token with `Contents: read` to raise the cap to 5,000 per hour:

```bash
GH_API_TOKEN=$(gh auth token) pnpm run build
```

## Project Structure

Inside of the project, you'll see the following folders and files:

```text
.
├─ public/
├─ src/
│  ├─ assets/
│  ├─ content/
│  │  ├─ docs/
│  │  └─ news/
│  ├─ pages/
│  └─ content.config.ts
├─ astro.config.mjs
├─ eslint.config.mjs
├─ prettier.config.mjs
├─ package.json
└─ tsconfig.json
```

Starlight looks for `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on
its file name.

Custom RSS feed is generated from the Markdown files in `src/content/news/`. Each file is exposed as a route based on
its file name, and the content is used to populate the RSS feed that are defined under `src/pages` for example
`src/pages/shelly-alpm/feeds/news/rss.xml.ts` which corresponds to the URL `/shelly-alpm/feeds/news/rss.xml`.

Astro [custom pages](https://starlight.astro.build/guides/pages/#custom-pages) are placed in the `src/pages/` directory.
Each file is exposed as a route based on its file name.

Images can be added to `src/assets/` and embedded in Markdown with a relative link.

**Styling Note:**  
When styling components, prefer to use the theme variables from
[Starlight's `props.css`](https://github.com/withastro/starlight/blob/main/packages/starlight/style/props.css) instead
of Tailwind CSS classes whenever possible. This helps maintain consistency with the design scheme.

**Conceptual Note:** There is a separation between "content" (Markdown files in `src/content/`) and "pages" (Astro
components in `src/pages/`). Content is for writing documentation, blog and RSS updates, while pages are for
"standalone" content (e.g. marketing or direct links) and custom routes. This separation helps keep things organized and
makes it easier to manage different types of information.

Static assets, like favicons, can be placed in the `public/` directory.

## Appearance

The footer offers two independent preferences: **Use device theme** (`auto`),
**Dark theme**, or **Light theme**; and the **Classic (Default)** or **Sea Glass**
palette. Device theme follows system changes while the page is open, with light
as the fallback. Without JavaScript, the site uses Classic and the device theme.

Selections are stored under `seafoam-appearance` and `seafoam-palette`.
Unrecognized values fall back to the defaults; legacy `starlight-theme` values
are ignored. If browser storage is unavailable, a changed preference still
applies to the current page and the footer reports that it could not be saved.

[appearance.ts](src/data/appearance.ts) supplies the option labels and allowed
values to both the provider and controls.
[ThemeProvider.astro](src/components/overrides/ThemeProvider.astro) restores
preferences before first paint and owns state updates, persistence, and system
theme changes. [SitePreferences.astro](src/components/SitePreferences.astro)
renders the footer controls and handles their disclosure positioning, dismissal,
and focus behavior. Each disclosure uses a native popover to place its panel
above Starlight's fixed header and isolated content pane. The default Starlight
selector remains suppressed.

When checking these controls in a browser, select options by clicking the radio,
the label text, and the row padding. All three targets must apply and save the
choice without dismissing the panel, and all use the pointer cursor. Also check
Tab departure and Escape, including after clicking empty panel padding.

The root's `data-appearance` stores the choice (`auto`, `light`, or `dark`);
`data-theme` stores only the resolved `light` or `dark` value for Starlight.
`data-palette` selects the palette. CSS sets `color-scheme` from the appearance
choice so palette colors and native controls agree.

[global.css](src/styles/global.css) imports both
[Classic](src/styles/themes/classic.css) and
[Sea Glass](src/styles/themes/sea-glass.css). Classic defines the fallback roles on `:root`;
Sea Glass overrides them within `:root[data-palette="sea-glass"]`. Each
`light-dark(light, dark)` pair follows the active `color-scheme`. Typography,
spacing, and layout stay outside palette files, and `global.css` maps shared
color roles to Starlight's properties.

| Color roles                                                                                                       | Responsibility                                                |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `--sf-canvas`, `--sf-surface`                                                                                     | Page background and shared panels                             |
| `--sf-text`, `--sf-text-muted`                                                                                    | Primary and supporting text                                   |
| `--sf-action`, `--sf-on-action`, `--sf-action-hover`, `--sf-action-pressed`                                       | Action fill, foreground, and interaction states               |
| `--sf-link`, `--sf-focus`, `--sf-boundary`                                                                        | Links, focus indicators, and control boundaries               |
| `--sf-shelly-surface`, `--sf-starfish-surface`, `--sf-aqueous-surface`, `--sf-pearl-surface`, `--sf-pori-surface` | Project-card backgrounds, named independently of their colors |
| `--sf-card-ink`, `--sf-card-border`, `--sf-card-link`                                                             | Project-card text, borders, and links                         |
| `--sf-card-action-hover`, `--sf-card-action-pressed`, `--sf-on-card-action`                                       | Project-card action states                                    |
| `--sf-hero-seafoam`, `--sf-hero-labs`                                                                             | The two hero-title color roles                                |

New components consume these roles rather than hard-coded theme colors. Keep
link and focus roles distinct even when their values match. Sea Glass assigns
amethyst to Shelly and Pearl, honey to Starfish and Pori, and rose to Aqueous;
Classic uses the canvas with a card border. These choices belong to the palette.
Classic's action hover/pressed shades supplement the supplied resting colors:
`#115E59` / `#134E4A` in light mode and `#2DD4A8` / `#14B8A6` in dark mode.
They are implementation choices, not additional values specified by the PDF.

To add a palette, create a file under `src/styles/themes/` defining the same
roles within `:root[data-palette="your-palette"]`, import it in `global.css`, and
add its value and label to `paletteOptions` in `appearance.ts`. The provider and
controls then accept it without separate value lists. Check text, action, focus,
and boundary contrast in both appearances, including hover and pressed states.

The older product-page gradients and Devario showcase still use the legacy
Tailwind colors in `global.css`. They will move to the shared roles as their
planned components are implemented; changing the palette does not yet recolor
every existing treatment.

Headings use Space Grotesk 500/600; body text and controls use DM Sans 400/500/600.
The self-hosted WOFF2 files in `src/assets/fonts/` were converted from the supplied
brand guide's font files without subsetting. Each family's SIL Open Font License
is retained alongside the fonts. The website makes no external font requests.

The footer icons load from Flaticon's CDN and retain a visible attribution link.
Their sources and separate license are recorded in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Commands

All commands are run from the root of the project, from a terminal:

- `pnpm install` to install dependencies

<!-- Separator -->

- `pnpm run dev` to start the local development server
- `pnpm run format` to format code with Prettier
- `pnpm run lint` to lint code with ESLint
- `pnpm run check` to run Astro's type checking diagnostics
- `pnpm run test:theme` to check appearance/palette initialization, persistence, and device-theme updates

<!-- Separator -->

- `pnpm run build` to build the production site
- `pnpm run preview` to preview the production build locally

<!-- Separator -->

- `pnpm run astro ...` to run Astro CLI commands, like `astro add` or `astro check`
- `pnpm run astro -- --help` to get help using the Astro CLI

## Useful links

### Formatting

- <https://github.com/withastro/prettier-plugin-astro>
- <https://github.com/tailwindlabs/prettier-plugin-tailwindcss>

### Linting

- <https://github.com/eslint/eslint>
- <https://github.com/typescript-eslint/typescript-eslint>
- <https://github.com/ota-meshi/eslint-plugin-astro>
- <https://docs.astro.build/en/guides/typescript/#type-checking>

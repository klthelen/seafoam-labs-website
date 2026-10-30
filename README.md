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

The site follows the system color preference, including changes while a page is
open. Light is the fallback. Old `starlight-theme` storage values are ignored;
there is no manual theme selector in the header or documentation menu.

The active color palette is imported once at the top of `src/styles/global.css`.
[Collected Glass](src/styles/themes/collected-glass.css) defines the `--sf-` color
roles for light and dark appearances. Component styles use those roles, and
`global.css` maps them to Starlight's properties. Typography, spacing, and layout
stay outside palette files.

To update colors, edit the active palette. To add an alternative, copy that file
into `src/styles/themes/`, keep the same role names, and change the palette import
in `global.css`. Import one palette at a time. Define light/fallback values in
`:root` and override the roles that change inside
`@media (prefers-color-scheme: dark)`. No component or theme script changes are
needed to select a different palette.

| Color roles                                                                                                       | Responsibility                                                |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `--sf-canvas`, `--sf-surface`                                                                                     | Page background and shared panels                             |
| `--sf-text`, `--sf-text-muted`                                                                                    | Primary and supporting text                                   |
| `--sf-action`, `--sf-on-action`, `--sf-action-hover`, `--sf-action-pressed`                                       | Action fill, foreground, and interaction states               |
| `--sf-link`, `--sf-focus`, `--sf-boundary`                                                                        | Links, focus indicators, and control boundaries               |
| `--sf-shelly-surface`, `--sf-starfish-surface`, `--sf-aqueous-surface`, `--sf-pearl-surface`, `--sf-pori-surface` | Project-card backgrounds, named independently of their colors |
| `--sf-card-ink`, `--sf-card-action-hover`, `--sf-card-action-pressed`, `--sf-on-card-action`                      | Foregrounds and action states shared by project cards         |

New components must consume these roles rather than hard-coded theme colors or
project-specific light/dark rules. Keep link and focus roles distinct even when
they share a value. Check text, action, focus, and boundary contrast in both
appearances when changing a palette. Collected Glass currently pairs Shelly and
Pearl with amethyst, Starfish and Pori with honey, and Aqueous with rose; those
assignments belong to the palette, not the card component.

Palette choice is independent of system appearance. CSS follows the preference
directly, while the inline `ThemeProvider.astro` keeps Starlight's `data-theme`
attribute in sync before first paint. Keep that attribute reserved for `light`
and `dark`.

The older product-page gradients and Devario showcase still use the legacy
Tailwind colors in `global.css`. They will move to the shared roles as their
planned components are implemented; changing the palette does not yet recolor
every existing treatment.

Headings use Space Grotesk 500/600; body text and controls use DM Sans 400/500/600.
The self-hosted WOFF2 files in `src/assets/fonts/` were converted from the supplied
brand guide's font files without subsetting. Each family's SIL Open Font License
is retained alongside the fonts. The website makes no external font requests.

## Commands

All commands are run from the root of the project, from a terminal:

- `pnpm install` to install dependencies

<!-- Separator -->

- `pnpm run dev` to start the local development server
- `pnpm run format` to format code with Prettier
- `pnpm run lint` to lint code with ESLint
- `pnpm run check` to run Astro's type checking diagnostics
- `pnpm run test:theme` to check system theme initialization and updates

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

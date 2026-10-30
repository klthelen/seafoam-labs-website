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

Collected Glass color roles live in `src/styles/global.css` under the `--sf-`
prefix and map to Starlight's theme properties. CSS follows the system preference
directly, while the inline `ThemeProvider.astro` keeps Starlight's `data-theme`
attribute in sync before first paint. Keep both aligned when changing this policy.

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

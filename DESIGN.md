# Design

Design conventions and implementation details for the website. Project setup
and commands are documented in [README.md](README.md).

## Appearance preferences

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

The root's `data-appearance` stores the choice (`auto`, `light`, or `dark`);
`data-theme` stores only the resolved `light` or `dark` value for Starlight.
`data-palette` selects the palette. CSS sets `color-scheme` from the appearance
choice so palette colors and native controls agree.

## Color palettes

[global.css](src/styles/global.css) imports both
[Classic](src/styles/themes/classic.css) and
[Sea Glass](src/styles/themes/sea-glass.css). Classic defines the fallback roles
on `:root`; Sea Glass overrides them within `:root[data-palette="sea-glass"]`.
Each `light-dark(light, dark)` pair follows the active `color-scheme`.
Typography, spacing, and layout stay outside palette files, and `global.css`
maps shared color roles to Starlight's properties.

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
Classic's hover and pressed shades extend the original palette to keep action
labels legible. The palette files hold the exact values.

The older product-page gradients and Devario showcase still use the legacy
Tailwind colors in `global.css`, so changing the palette does not yet recolor
every existing treatment.

### Adding a palette

Create a file under `src/styles/themes/` defining the same roles within
`:root[data-palette="your-palette"]`, import it in `global.css`, and add its
value and label to `paletteOptions` in `appearance.ts`. The provider and
controls then accept it without separate value lists. Check text, action, focus,
and boundary contrast in both appearances, including hover and pressed states.

## Typography and icons

Headings use Space Grotesk 500/600; body text and controls use DM Sans 400/500/600.
The WOFF2 files are self-hosted in [src/assets/fonts/](src/assets/fonts/), with
each family's SIL Open Font License retained alongside the fonts.

The footer icons load from Flaticon's CDN and retain a visible attribution link.
Their sources and separate license are recorded in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Verification

Run `pnpm run test:theme` to check preference initialization, persistence, and
device-theme updates.

When checking the controls in a browser, select options by clicking the radio,
the label text, and the row padding. All three targets must apply and save the
choice without dismissing the panel, and all use the pointer cursor. Also check
Tab departure and Escape, including after clicking empty panel padding.

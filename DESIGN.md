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
| `--sf-link`, `--sf-link-hover`, `--sf-focus`, `--sf-boundary`                                                     | Links, focus indicators, and control boundaries               |
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

## Actions and links

Shared treatments in `global.css` apply to native elements. Use an anchor with
`href` for navigation and a button for an action; set `type="button"` unless it
submits a form. The existing Starlight `LinkButton` variants use these same
treatments, including hero actions on documentation and product pages.

| Classes                          | Treatment                                                           |
| -------------------------------- | ------------------------------------------------------------------- |
| `sf-action sf-action--primary`   | Filled primary action                                               |
| `sf-action sf-action--secondary` | Outlined action on a neutral surface                                |
| `sf-action sf-action--card`      | Outlined action using the project-card color roles                  |
| `sf-icon-control`                | Icon-only link or button with an accessible name                    |
| `sf-link`                        | Underlined contextual link                                          |
| `sf-link sf-link--card`          | Contextual link on a project card                                   |
| `sf-nav-link`                    | Navigation link, underlined on hover and when `aria-current="page"` |

Normal actions have a minimum height of 3rem and 1.5rem horizontal padding.
Add `sf-action--compact` for a minimum height of 2.75rem and 1.25rem horizontal
padding where the component guide calls for a compact control. Icon controls
have a minimum 2.75rem square target; glyphs are 1.25rem with a 0.5rem gap to
labels. Keep at least 0.75rem between adjacent controls in the owning layout.
Labels wrap and controls grow with their content.

Focus adds a separate 2px outline with a 3px offset, preserving the current fill
and space around the control. Card actions and links use the card ink for focus.
Keep that outline clear of clipping containers. Contextual links retain their
color after a visit; hover thickens the underline. Shared actions have immediate
feedback without movement or animation.

Use native `disabled` only for an unavailable button, with a visible explanation
at the call site. Disabled buttons do not receive hover or pressed treatments.
Navigation links remain usable; do not simulate a disabled link with these styles.
Unclassed links and buttons keep their existing component or framework styling.

## Menu links

[MenuLink.astro](src/components/navigation/MenuLink.astro) renders one complete
anchor row for the Projects and Site menus. It requires `href` and `label` and
accepts an optional `description`, a named Starlight `icon`, `current`, and `rel`.
The caller supplies the current-page state; only that row's label is underlined
and its anchor receives `aria-current="page"`. Icons are decorative beside the
visible label. Links use normal browser navigation without client JavaScript.

Rows with a description use the project treatment: an 18px label, 14px
description, and minimum height of 72px, reducing to 64px from 64rem wide.
Ordinary rows have a 16px label and a minimum height of 52px. These dimensions
are expressed in rem; rows grow with wrapped or enlarged text. The same markup
serves both arrangements.

Hover-capable pointers and active presses highlight the whole row with the
palette's action colors. Touch scrolling uses native link behavior; hover-only
styles do not leave a selected-looking row behind on touch devices. Keyboard
focus uses the shared 2px outline and 3px offset, independently of the fill.
The containing menu must leave room around rows for that outline. Popup
containers own placement, dismissal, and scrolling.

## Navigation disclosures

[NavigationDisclosure.astro](src/components/navigation/NavigationDisclosure.astro)
provides a native `details` / `summary` control. Supply non-interactive trigger
content in the `trigger` slot and the navigation list in the default slot. The
trigger content must include its visible label or an accessible text alternative
for an icon. The browser owns expanded/collapsed semantics and Enter/Space
activation; do not add redundant roles or `aria-expanded` to the summary.

Use `align="start"` (the default) for Projects and `align="end"` for Site menu.
Mark their containing header capsule with `data-navigation-header`. The popup
starts 12px below that element's measured bottom, including when its controls
wrap. Desktop placement follows the trigger; compact placement follows the capsule
edge. The Header supplies its current arrangement and viewport gutter through
CSS properties, so popup placement also follows text enlargement. Standalone
disclosures fall back to a 64rem breakpoint with 24px desktop or 16px compact
viewport gutters.

The panel uses a 22.5rem width, 1rem padding, 1.5rem corners, and the shared surface
and boundary roles. Its height follows the content and scrolls within the available
visible space. With JavaScript, a manual popover places it above surrounding
content without a backdrop or layout shift. Without the enhancement, the same
links expand in normal document flow through native `details`.

Opening preserves trigger focus. Escape closes and returns focus to the trigger;
outside pointer presses and focus departure close without redirecting focus.
The component emits a bubbling `navigation-disclosure-toggle` event with
`detail.open`. The owning Header coordinates other disclosures and Search; it
can close a disclosure by setting its native `open` property to `false`. When a
navigation arrangement changes on resize, that owner closes hidden menus and
places any affected focus on a visible control.

## Projects menu

[ProjectsMenu.astro](src/components/navigation/ProjectsMenu.astro) combines the
shared disclosure and menu links. It owns the six project labels, descriptions,
and overview destinations in this order: Devario, Shelly ALPM, Starfish, Aqueous,
Pearl, and Pori. The current overview receives `aria-current="page"` and a label
underline. Matching accepts either trailing-slash form; other pages, including
documentation within a project, do not mark an overview as the current page.

The Projects label is 20px with a 24px line height in the compact Header and 16px
with the same line height on desktop. Its decorative chevron is 12px. Rows retain
the shared 12px spacing so adjacent hover and focus treatments remain separate.
Panel height follows these rows and their content, with scrolling handled by
the disclosure. The containing header supplies `data-navigation-header` for
placement below its full height.

## Site menu

[SiteMenu.astro](src/components/navigation/SiteMenu.astro) uses the shared disclosure
with end alignment. It lists Wiki, Blog, and About from
[navigation.ts](src/data/navigation.ts), shared with the Header's inline links,
then reads the social links from Starlight's `social` configuration. External rows
retain the configured labels, icons, destinations, normal tab behavior, and
`rel="me"`. Only an exact
internal destination receives `aria-current="page"`, accepting either
trailing-slash form.

The 20px hamburger and its accessible name, Open menu, become an X and Close menu
when the native disclosure opens. CSS follows the `open` attribute, so both the
icon and name also change without JavaScript. The shared trigger supplies the
44px target, circular open fill, and focus outline.

Rows use the ordinary 52px minimum height with 12px gaps for separate hover and
focus treatments. One 1px boundary divider, with 12px space above and below,
separates the internal and social groups. It is omitted when no social links are
configured. The panel follows its content height. The Header controls compact
visibility, closes the menu when switching to desktop, and moves any affected
focus to a visible counterpart.

## Social links

[SocialIcons.astro](src/components/overrides/SocialIcons.astro) renders the
configured social links as 20px icons in targets of at least 44px, with 4px gaps.
Each link retains its configured accessible name, destination, and `rel="me"`,
using normal browser navigation. The group can wrap when space is limited.

The links reuse `sf-nav-link` for their neutral text color and shared focus
outline. Hover and press use the link color without adding a filled background.
The icons remain decorative alongside visually hidden labels. Header integration
controls visibility: show this group with the full navigation and the Site menu's
labeled social rows with the compact arrangement.

## Header

[Header.astro](src/components/overrides/Header.astro) owns the primary navigation
capsule and coordinates Projects, Site menu, and the existing Starlight Search
dialog. Opening one closes the others. Search retains its provider, keyboard
shortcut, and modal behavior; the planned inline search field is a separate unit.

The compact capsule has a 4rem minimum height, 16px outer gutters, and 8px
inner padding, increasing to 12px where space permits. Icon targets stay at least
44px while text can grow. From a container width of 64rem, it shows the inline
page and social links, uses a 5rem minimum height,
and centers within a 73.5rem maximum width. The container query follows root text
size so enlarged text keeps the compact arrangement longer. Controls can wrap
without changing their reading order. The home mark retains Starlight's site
title as its accessible name.

The homepage header stays in normal document flow. Other pages retain Starlight's
fixed frame; a resize observer supplies its measured height to `--sl-nav-height`
so the content, table of contents, and sidebar remain below it. CSS supplies the
initial offsets. Without JavaScript, the header stays in normal flow so native
disclosures can expand without covering page content.

[MobileMenuToggle.astro](src/components/overrides/MobileMenuToggle.astro) preserves
Starlight's native documentation-sidebar popover control, with a visible
Documentation label in its own row below the compact capsule. Its measured
height reserves enough space when the label wraps. The sidebar becomes permanent
at Starlight's existing 50rem breakpoint; this is independent of the site's
64rem navigation breakpoint. Opening documentation navigation closes site menus,
and opening a site menu or Search closes the compact documentation sidebar.

When resizing hides a focused navigation control, the Header moves focus to its
visible counterpart, the home link, or the relevant menu control. Opening Search
from inside a menu first establishes its visible trigger as the return target.
Appearance changes do not reset an open menu.

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

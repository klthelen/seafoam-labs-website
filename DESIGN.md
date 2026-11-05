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
The empty status region remains exposed before an update, with polite, atomic
feedback that does not take focus.

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

Printing resolves the palette's light colors and uses Starlight's print text and
page-background roles. This keeps documentation legible with or without printed
background graphics without changing the saved screen preferences. Printed
Markdown tables wrap within the page width instead of retaining their screen
scrolling region. Code prints in the same readable ink as body text, including
when background graphics are disabled. Starlight continues to own semantic
aside colors.

| Color roles                                                                                                       | Responsibility                                                |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `--sf-canvas`, `--sf-surface`                                                                                     | Page background and shared panels                             |
| `--sf-text`, `--sf-text-muted`                                                                                    | Primary and supporting text                                   |
| `--sf-action`, `--sf-on-action`, `--sf-action-hover`, `--sf-action-pressed`                                       | Action fill, foreground, and interaction states               |
| `--sf-link`, `--sf-link-hover`, `--sf-focus`, `--sf-boundary`                                                     | Links, focus indicators, and control boundaries               |
| `--sf-nav-link-hover`                                                                                             | Header text-link hover color, distinct from the resting text  |
| `--sf-shelly-surface`, `--sf-starfish-surface`, `--sf-aqueous-surface`, `--sf-pearl-surface`, `--sf-pori-surface` | Project-card backgrounds, named independently of their colors |
| `--sf-card-ink`, `--sf-card-border`, `--sf-card-link`                                                             | Project-card text, borders, and links                         |
| `--sf-card-action-hover`, `--sf-card-action-pressed`, `--sf-on-card-action`                                       | Project-card action states                                    |
| `--sf-hero-seafoam`, `--sf-hero-labs`                                                                             | The two hero-title color roles                                |

New components consume these roles rather than hard-coded theme colors. Keep
link and focus roles distinct even when their values match. Sea Glass assigns
amethyst to Shelly and Pearl, honey to Starfish and Pori, and rose to Aqueous;
Classic uses the canvas with a card border. These choices belong to the palette.
Filled action states derive from each palette's normal fill: hover mixes 90%
of `--sf-action` with 10% black, and press mixes 80% with 20% black, in sRGB.
This darkens the fill while preserving its hue and follows future palette
changes automatically. The label keeps `--sf-on-action` at full opacity;
check its contrast in every state when changing a palette's base colors.

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
Disclosure triggers use the palette's action fill and contrasting text on hover,
matching the header's icon controls, with no underline. The same fill marks the
open state, and the shared keyboard focus outline remains visible.

Use `align="start"` (the default) for Projects and `align="end"` for Site menu.
Mark their containing navigation row with `data-navigation-header`. The popup
starts 12px below that element's measured bottom, including when its controls
wrap. Desktop placement follows the trigger; compact placement follows the capsule
edge. The Header supplies its current arrangement and viewport gutter through
CSS properties, so popup placement also follows text enlargement. Standalone
disclosures fall back to a 64rem breakpoint with 24px desktop or 16px compact
viewport gutters.

The panel uses a 22.5rem width, 1rem padding, 1.5rem corners, and the shared surface
and boundary roles. Its height follows the content. When the full list fits in
the visible viewport, the panel can use the bottom clearance to avoid an
unnecessary scrollbar. Taller lists scroll within the available space.
With JavaScript, a manual popover places it above surrounding
content without a backdrop or layout shift. Without the enhancement, the same
links expand in normal document flow through native `details`.

When fewer than 240px remain below the capsule, the popup uses the viewport's
height with 8px vertical gutters and inner padding. Text and link targets retain
their size. If this covers the focused trigger, focus moves to the first link;
Escape still closes the popup and returns focus to its trigger.

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

The Projects label inherits DM Sans 600 from the shared disclosure trigger,
matching the header's text links, at 1.25rem with a 1.5rem line height in both
compact and desktop headers. Its content adds 0.25rem vertical and 0.5rem
horizontal padding to the shared trigger, giving 12px vertical
and 16px horizontal padding at the default text size. The label and 32px
chevron form a centered group with a 0.5rem gap. The chevron points down when
closed and up when open, following the native disclosure state. Rows retain the
shared 12px spacing so adjacent hover and focus treatments remain separate.
Panel height follows these rows and their content, with scrolling handled by
the disclosure. The containing header supplies `data-navigation-header` for
placement below its full height.

## Site menu

[SiteMenu.astro](src/components/navigation/SiteMenu.astro) uses the shared disclosure
with end alignment. Home is first and uses Starlight's `siteTitleHref`, matching
the header's home link. Wiki, Blog, and About follow from
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
capsule and coordinates Projects, Site menu, and inline Search. Opening one
closes the others. Search replaces the middle navigation with its input and
close control, retaining the logo and the desktop social group. Escape and the
close control restore Search focus; outside dismissal respects the clicked
target.

The Home, Wiki, Blog, and About links use `--sf-nav-link-hover` for hover
feedback instead of an underline. All four links use DM Sans 600, with no
underline at rest or on hover. The current page retains `aria-current="page"`,
and keyboard focus keeps the shared outline.
The navigation hover role is separate because Sea Glass's ordinary link hover
color matches the header's resting text in dark mode. Contextual links within
page content retain their underlines.

[Search.astro](src/components/overrides/Search.astro) uses the Pagefind UI and
index assets generated by the installed Starlight integration. Its native
popover previews three matching pages with short excerpts and a **View all
results** link. Enter in the field opens the same full results page, carrying
the search term in `?q=`. The preview omits nested section matches and the
provider's Load more button. When the preview cannot fit the available viewport
height, including space lost to a software keyboard, it shows the result count
and full-results link so the preview does not need scrolling. Focus moves to that
link if resizing hides a focused preview result.

[The search route](src/pages/search/index.astro) uses the ordinary Starlight
shell and [SearchPage.astro](src/components/search/SearchPage.astro) for results
in the document flow. It includes section matches and loads ten pages at a time;
Pagefind's Load more button exposes additional matches. Queries initialize from
the URL, and edits replace the current query parameter without creating a browser
history entry for every keystroke. The search page is excluded from the index.
Its header search icon and Control/Command+K focus the page's field instead of
opening a second search interface.

Both presentations share [the Pagefind initializer](src/utils/pagefind.ts) and
[search styles](src/styles/search.css), retaining translations and result URL
handling. The initializer waits for search metadata and WASM before accepting a
query. Initial loading failure asks the visitor to reload; the development server
keeps Starlight's production-only search notice. Indexed queries must be checked
against a fresh production build and preview. The search page ships directly,
without a feature flag.

The search field reveals from the search control over 200ms and retracts over
140ms when dismissed. Navigation returns after the closing animation, while
Escape and the close control return keyboard focus immediately. The closing
interface is inert and its results are dismissed. Reduced-motion preferences
skip both animations.

Pagefind 1.5.2 has a retained limitation after initialization: a failed index
chunk download can appear as no results, while failed result-detail downloads
can leave incomplete results. Its default UI does not expose these failures
reliably. The handoff review explicitly accepted retaining the installed
provider and documenting this behavior instead of adding a custom network
adapter. Reloading the page retries these downloads. Recheck this behavior when
Pagefind is deliberately upgraded; do not treat an empty result as proof of a
successful network request in failure tests.

The compact capsule has a 4rem minimum height, 16px outer gutters, and 8px
inner padding, increasing to 12px where space permits. Icon targets stay at least
44px while text can grow. From a container width of 64rem, it shows the inline
page and social links, uses a 6rem minimum height and 2rem horizontal padding,
and centers within a 77.5rem maximum width to match the homepage content. Desktop
text links and the search input use 1.25rem text. The logo grows to 2.5rem, and
search and social icons use 1.5rem glyphs in targets of at least 3rem.

From a container width of 80rem, the surface spans the full viewport and sits
flush against the top edge when the page is at the top, with safe-area clearance
where needed. A centered pill sits over that backdrop, using a 77.5rem maximum
width, a 4.5rem minimum height, and 0.75rem space above and below. As the page
scrolls, only the full-width backdrop moves away; the pill keeps its position,
size, and rounded shape. A restrained shadow separates it from the content.
Returning to the top brings the backdrop back behind the pill. The reserved
height stays at 6rem so the page does not jump. Only the shadow fades, over 200ms;
reduced motion disables that transition.

Wiki and documentation pages keep the full-width backdrop fixed at the top
while scrolling. Their header does not detach or gain the floating-pill shadow,
so it remains visually connected to the documentation navigation.

Below that width, the header retains its pill shape and outer spacing, including
in narrow or split-screen desktop windows.

Home, Projects, Wiki, Blog, and About each have 1rem horizontal padding and
a 1rem gap between controls. The page-links group inherits the header's gap
so it keeps the same spacing as Home and Projects. Projects includes its label
and chevron within that padding. Disclosure padding also uses rem so these
insets stay equal when the root text size changes.
These rem dimensions follow the root text size. The container query follows
root text size so enlarged text keeps the compact arrangement longer. Controls
can wrap without changing their reading order.

The desktop header places a separate Home text link between the logo and
Projects, using the header's ordinary spacing. The logo and text are independent
links and keyboard stops, both using Starlight's `siteTitleHref`. The logo retains
Starlight's SiteTitle component and accessible site name. Compact layouts keep
the logo in the header and provide Home as the first site-menu entry. The desktop
Home link uses the shared focus outline and the same weight as the other text
links.
Opening Search hides the desktop Home text link with the other navigation links,
retaining the logo. When resizing hides the desktop Home link, focus moves to the
site-menu trigger. When the compact menu disappears, its focused Home entry
transfers focus to the desktop Home link.

All pages use Starlight's fixed header frame; a resize observer supplies its
measured height to `--sl-nav-height` so the content, table of contents, and sidebar
remain below it. CSS supplies the initial offsets. Without JavaScript, the header
stays in normal flow so native disclosures can expand without covering page
content. The short-viewport layout also keeps the header in normal flow to leave
room for reading.

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

At viewport heights of 32rem or less, the header and mobile table of contents
scroll with the article. Skip links use a small reading offset instead of the
fixed-header offset. The permanent documentation sidebar occupies its own grid
column and scrolls within the viewport. Compact documentation navigation fills
the viewport, with a native Close documentation button supplied by
[Sidebar.astro](src/components/overrides/Sidebar.astro). That override retains
Starlight's sidebar content, state persistence, and navigation behavior.

## Homepage components

The homepage retains Starlight's configured hero and original Chel image. Its
scoped layout places the introduction before the mascot on compact screens and
beside it on desktop. Copy and actions stay left aligned; the compact mascot
is centered below them. The title uses solid palette colors, followed by the
approved tagline and one Learn more link to the Wiki. Product-page heroes keep
their existing presentation.

The homepage uses one [ProjectCard.astro](src/components/ProjectCard.astro) for
the five explicit project descriptions. Palette roles select each surface;
the collection owns its responsive columns. Cards have natural content height
and align actions within desktop rows. Aqueous and Pearl retain their overview
destinations, as confirmed during the handoff. Heading permalinks can wrap with
enlarged text instead of widening the page.

The homepage Devario feature replaces the previous desktop illustration and
feature list. Overview is a text link beside the heading, followed by the
description and the Download ISO and Copy checksum controls. Desktop places
the enlarged fish alongside this content, with View on GitHub in the upper
right. Compact layouts wrap the heading and controls as needed, then place
the fish and GitHub link below the introduction.

The approved stronger dithered fish is used as an alpha mask in the current
text color. The transparent derivative preserves all 4569 × 2533 source pixels:
only the original blue background pixels become transparent; the shape and
dithering are unchanged. No palette-specific image copies are needed.

The homepage footer uses the approved Seafoam Shore v2 artwork: daylight in
light mode and twilight in dark mode, for both Classic and Sea Glass. Links,
appearance controls, copyright, Flaticon attribution, and the JetBrains credit
are real content above the illustration. The original shellheart identifies
the brand. Other routes retain the compact footer and Starlight's footer content.

The panoramic artwork is used at every viewport width. It scales from 1080px to
its native 2172px width, preserving its aspect ratio. Narrower screens clip the
sides around the shell, starfish, and pearl cluster, whose center is 75% across
the image. The horizontal offset is clamped to the image edges so wider screens
reveal more of the scene without introducing blank space. Clipping is confined
to the decorative artwork; footer links and controls remain outside it.

Beyond 2172px, a CSS transparency mask softens both outer edges into the active
page background. The fade grows with the side gutters up to 12rem. Responsive
WebP exports live in `public/images/shoreline/`; their `sizes` hints describe the
full rendered image width, including the cropped portion. Negative top margins
compensate for the image's transparent upper area. The illustration does not
intercept pointer input and is omitted from print.

The homepage frame lets the illustration span the viewport while its hero,
project content, and footer links share a 77.5rem maximum width. The former
resource cards and standalone Powered by block are removed. Their useful
destinations and credit remain in the footer or Wiki; the package repository
is still linked from the Wiki introduction.

## Release checksum

[consts.ts](src/consts.ts) keeps the ISO URL, checksum-file URL, and published
SHA-256 together while preserving the existing documentation imports. The
digest for `devario-2026.10.28-x86_64.iso` was verified against its mirror file
on 3 November 2026. Update these values together when changing the release.
No download size is displayed without verified metadata.

[CopyChecksum.astro](src/components/CopyChecksum.astro) copies the digest through
the browser clipboard API and reports success only after the write succeeds.
Its status region exists before the action and does not take focus. There is
no separate checksum-file link in the homepage card. The digest itself becomes
available for manual selection when copying fails, the API is unavailable,
or JavaScript is disabled. The setup documentation retains its checksum-file link.

## Typography and icons

Headings use Space Grotesk 500/600; body text and controls use DM Sans 400/500/600/700.
The WOFF2 files are self-hosted in [src/assets/fonts/](src/assets/fonts/), with
each family's SIL Open Font License retained alongside the fonts.

Astro generates the two footer icons from their Flaticon sources at build time,
so the published website serves them locally. Only those two remote image paths
are authorized in the image configuration. The icons retain their visible
attribution link; their sources and separate license are recorded in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Verification

Run `pnpm run test:theme` to check preference initialization, persistence, and
device-theme updates.

When checking the controls in a browser, select options by clicking the radio,
the label text, and the row padding. All three targets must apply and save the
choice without dismissing the panel, and all use the pointer cursor. Also check
Tab departure and Escape, including after clicking empty panel padding.

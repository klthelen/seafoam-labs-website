// @ts-check

import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import starlightChangelogs, {
  makeChangelogsSidebarLinks,
} from "starlight-changelogs";

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PROD
    ? "https://www.seafoam-labs.org"
    : "http://localhost:4321",
  integrations: [
    starlight({
      title: "Seafoam Labs",
      editLink: {
        baseUrl: "https://github.com/Seafoam-Labs/website/edit/main/",
      },
      logo: {
        src: "./src/assets/images/shellheart-small.webp",
      },
      favicon: "/favicon.png",
      head: [
        {
          tag: "meta",
          attrs: {
            name: "darkreader-lock",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "/og-shellheart.webp",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "twitter:image",
            content: "/og-shellheart.webp",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "icon",
            href: "/favicon.ico",
            sizes: "48x48",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "alternate",
            type: "application/rss+xml",
            title: "Seafoam Labs: Shelly news and updates",
            href: "/shelly-alpm/feeds/news/rss.xml",
          },
        },
      ],
      social: [
        {
          icon: "patreon",
          label: "Patreon",
          href: "https://www.patreon.com/cw/SeafoamLabs",
        },
        {
          icon: "fluxer",
          label: "Fluxer",
          href: "https://fluxer.gg/vOjrMXcE",
        },
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Seafoam-Labs",
        },
      ],
      sidebar: [
        { slug: "welcome" },
        {
          label: "Shelly ALPM",
          items: [
            "shelly-alpm/overview",
            "shelly-alpm/installation",
            {
              label: "Documentation",
              items: [{ autogenerate: { directory: "shelly-alpm/docs" } }],
            },
            ...makeChangelogsSidebarLinks([
              {
                type: "all",
                base: "shelly-alpm/changelog",
                label: "Changelog",
              },
            ]),
          ],
        },
        {
          label: "Devario",
          items: [
            "devario/overview",
            "devario/setup",
            "devario/graphics",
            "devario/platform",
            "devario/readiness",
            {
              label: "For organizations",
              collapsed: true,
              items: ["devario/for-business", "devario/pilot"],
            },
          ],
        },
        {
          label: "Starfish",
          items: [
            { autogenerate: { directory: "starfish" } },
            ...makeChangelogsSidebarLinks([
              {
                type: "all",
                base: "starfish/changelog",
                label: "Changelog",
              },
            ]),
          ],
        },
        {
          label: "Aqueous",
          items: [
            { autogenerate: { directory: "aqueous" } },
            {
              label: "Config References",
              items: [
                {
                  link: "aqueous/docs/toml/wm/",
                  label: "wm.toml",
                },
                {
                  link: "aqueous/docs/toml/outputs/",
                  label: "outputs.toml",
                },
                {
                  link: "aqueous/docs/toml/rules/",
                  label: "rules.toml",
                },
                {
                  link: "aqueous/docs/toml/layout/",
                  label: "layout.toml",
                },
                {
                  link: "aqueous/docs/toml/input/",
                  label: "input.toml",
                },
              ],
            },
            ...makeChangelogsSidebarLinks([
              {
                type: "all",
                base: "aqueous/changelog",
                label: "Changelog",
              },
            ]),
          ],
        },
        {
          label: "Pearl",
          items: [
            "pearl/overview",
            "pearl/installation",
            {
              label: "Documentation",
              items: [{ autogenerate: { directory: "pearl/docs" } }],
            },
            ...makeChangelogsSidebarLinks([
              {
                type: "all",
                base: "pearl/changelog",
                label: "Changelog",
              },
            ]),
          ],
        },
        {
          label: "Pori",
          items: [
            { autogenerate: { directory: "pori" } },
            ...makeChangelogsSidebarLinks([
              {
                type: "all",
                base: "pori/changelog",
                label: "Changelog",
              },
            ]),
          ],
        },
      ],
      expressiveCode: {
        themes: ["catppuccin-macchiato", "catppuccin-latte"],
      },
      customCss: ["./src/styles/global.css"],
      components: {
        ThemeProvider: "./src/components/overrides/ThemeProvider.astro",
        ThemeSelect: "./src/components/overrides/ThemeSelect.astro",
        Header: "./src/components/overrides/Header.astro",
        PageTitle: "./src/components/overrides/PageTitle.astro",
        SocialIcons: "./src/components/overrides/SocialIcons.astro",
        Footer: "./src/components/overrides/Footer.astro",
      },
      plugins: [starlightChangelogs()],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

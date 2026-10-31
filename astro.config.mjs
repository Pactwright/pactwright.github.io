// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// Served by GitHub Pages at the organisation's root: https://pactwright.github.io/
export default defineConfig({
  site: "https://pactwright.github.io",
  integrations: [
    starlight({
      title: "Pactwright",
      description: "Escrow, verdicts and receipts for purchases made by AI agents on Stellar.",
      logo: { src: "./src/assets/seal.svg", alt: "Pactwright" },
      favicon: "/favicon.svg",
      social: [
        { icon: "github", label: "Pactwright on GitHub", href: "https://github.com/Pactwright" },
        { icon: "discord", label: "Pactwright on Discord", href: "https://discord.gg/4WFU6fwPe" },
        { icon: "telegram", label: "Pactwright on Telegram", href: "https://t.me/Pactwright" },
      ],
      editLink: { baseUrl: "https://github.com/Pactwright/pactwright.github.io/edit/main/" },
      lastUpdated: true,
      // Code sits in a dark glass frame inside the page: one dark theme, JetBrains Mono.
      expressiveCode: {
        themes: ["github-dark"],
        useStarlightUiThemeColors: false,
        styleOverrides: {
          codeFontFamily: '"JetBrains Mono Variable", ui-monospace, monospace',
          codeFontSize: "0.875rem",
          codeBackground: "rgba(7, 11, 23, 0.72)",
          borderColor: "rgba(129, 140, 248, 0.22)",
          borderRadius: "12px",
          frames: {
            editorTabBarBackground: "rgba(13, 20, 40, 0.9)",
            terminalTitlebarBackground: "rgba(13, 20, 40, 0.9)",
            frameBoxShadowCssValue: "0 20px 40px -24px rgba(0, 0, 0, 0.8)",
          },
        },
      },
      customCss: [
        "@fontsource-variable/unbounded",
        "@fontsource-variable/manrope",
        "@fontsource-variable/jetbrains-mono",
        "./src/styles/tokens.css",
        "./src/styles/docs.css",
      ],
      components: {
        // One look (dark, glass, block grid) rather than separate light and dark themes.
        ThemeSelect: "./src/components/NoThemeSelect.astro",
        Footer: "./src/components/CommunityFooter.astro",
      },
      sidebar: [
        {
          label: "Start here",
          items: [
            { label: "What is Pactwright?", slug: "docs" },
            { label: "Quickstart", slug: "docs/quickstart" },
          ],
        },
        {
          label: "How it works",
          items: [
            { label: "A pact, step by step", slug: "docs/concepts/lifecycle" },
            { label: "Protection modes", slug: "docs/concepts/modes" },
            { label: "The verifier", slug: "docs/concepts/verifier" },
            { label: "Receipts and certificates", slug: "docs/concepts/receipts" },
            { label: "Who you have to trust", slug: "docs/concepts/trust" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Sell behind a pact", slug: "docs/guides/seller" },
            { label: "Buy as an agent", slug: "docs/guides/agent" },
            { label: "Run a verifier", slug: "docs/guides/verifier" },
            { label: "Check a certificate", slug: "docs/guides/certificates" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "Contract API", slug: "docs/reference/contract" },
            { label: "Verifier HTTP API", slug: "docs/reference/verifier-api" },
            { label: "Hashes and signed messages", slug: "docs/reference/hashing" },
            { label: "Configuration", slug: "docs/reference/configuration" },
            { label: "Packages", slug: "docs/reference/packages" },
            { label: "Testnet deployments", slug: "docs/reference/deployments" },
          ],
        },
        {
          label: "Project",
          items: [
            { label: "Status and evidence", slug: "docs/project/status" },
            { label: "Licenses and credits", slug: "docs/project/licenses" },
            { label: "Contributing", slug: "docs/project/contributing" },
          ],
        },
      ],
    }),
  ],
});

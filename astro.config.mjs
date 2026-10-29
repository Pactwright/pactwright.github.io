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
      social: [{ icon: "github", label: "Pactwright on GitHub", href: "https://github.com/Pactwright" }],
      editLink: { baseUrl: "https://github.com/Pactwright/pactwright.github.io/edit/main/" },
      lastUpdated: true,
      // Code reads as typed matter on the page: one light theme, typewriter face, paper frame.
      expressiveCode: {
        themes: ["github-light"],
        useStarlightUiThemeColors: false,
        styleOverrides: {
          codeFontFamily: '"Courier Prime", "Courier New", monospace',
          codeFontSize: "0.9rem",
          codeBackground: "rgba(255, 255, 255, 0.55)",
          borderColor: "#b7cbc1",
          borderRadius: "3px",
          frames: {
            editorTabBarBackground: "#dae5df",
            terminalTitlebarBackground: "#dae5df",
            frameBoxShadowCssValue: "0 2px 6px rgba(29, 35, 80, 0.12)",
          },
        },
      },
      customCss: [
        "@fontsource-variable/bodoni-moda/opsz.css",
        "@fontsource-variable/bodoni-moda/opsz-italic.css",
        "@fontsource/courier-prime/400.css",
        "@fontsource/courier-prime/700.css",
        "./src/styles/tokens.css",
        "./src/styles/docs.css",
      ],
      components: {
        // One look, paper on a leather desk, rather than separate light and dark themes.
        ThemeSelect: "./src/components/NoThemeSelect.astro",
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

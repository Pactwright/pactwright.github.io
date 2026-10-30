<p align="center">
  <img src="public/seal.svg" alt="Pactwright" width="96">
</p>

<h1 align="center">pactwright.github.io</h1>

<p align="center">
  The Pactwright website and documentation, served at <a href="https://pactwright.github.io/"><b>pactwright.github.io</b></a>.
</p>

<p align="center">
  <a href="https://pactwright.github.io/"><b>Home</b></a> ·
  <a href="https://pactwright.github.io/docs/"><b>Documentation</b></a> ·
  <a href="https://pactwright.github.io/docs/quickstart/"><b>Quickstart</b></a> ·
  <a href="https://github.com/Pactwright/pactwright.github.io/actions/workflows/deploy.yml">Deploys</a>
</p>

Pactwright is escrow, verdicts and receipts for purchases made by AI agents on Stellar. This repository holds its landing page and its documentation. The code lives in [Pactwright-contracts](https://github.com/Pactwright/Pactwright-contracts), [Pactwright-Kit](https://github.com/Pactwright/Pactwright-Kit) and [Pactwright-studio](https://github.com/Pactwright/Pactwright-studio).

## Edit a page

Docs pages are Markdown in [`src/content/docs/docs/`](src/content/docs/docs). Every page on the site also has an **Edit page** link that opens its file here. The landing page is [`src/pages/index.astro`](src/pages/index.astro).

Keep the docs true to the code: when a page states a value (a contract ID, a variable name, a default), it should match the repository it describes. If you change behaviour in one of the code repositories, update the matching page here.

## Run it locally

Requires Node.js 24 and pnpm.

```bash
pnpm install
pnpm dev            # http://localhost:4321
pnpm build          # the static site, in dist/
pnpm check-links    # after a build: every internal link and #anchor must resolve
```

## How it's built and deployed

- [Astro](https://astro.build) with [Starlight](https://starlight.astro.build) for the docs; search is built in (Pagefind).
- The look is shared with Studio: a web3 base (dark block grid, frosted glass panels, solid teal and indigo, no gradients) that keeps the pieces carrying meaning tactile, namely the seal, neon state stamps and the pact as a chain of blocks. [`src/styles/tokens.css`](src/styles/tokens.css) holds the tokens, [`docs.css`](src/styles/docs.css) themes Starlight, [`landing.css`](src/styles/landing.css) styles the landing page. Fonts (Unbounded, Manrope, JetBrains Mono) are self-hosted.
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds the site, checks every internal link, and publishes it to GitHub Pages on each push to `main`. Pull requests get the build and the link check.

## License

[MIT](LICENSE).

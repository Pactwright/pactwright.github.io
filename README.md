<p align="center">
  <img src="public/seal.svg" alt="Pactwright" width="96">
</p>

<h1 align="center">pactwright.github.io</h1>

<p align="center">
  <b>The Pactwright website and documentation.</b><br>
  Landing page and docs, served at <a href="https://pactwright.github.io/">pactwright.github.io</a>.
</p>

<p align="center">
  <a href="https://github.com/Pactwright/pactwright.github.io/actions/workflows/deploy.yml"><img src="https://github.com/Pactwright/pactwright.github.io/actions/workflows/deploy.yml/badge.svg" alt="Deploy status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license"></a>
</p>

<p align="center">
  <a href="https://pactwright.github.io/"><b>Home</b></a> ·
  <a href="https://pactwright.github.io/docs/"><b>Documentation</b></a> ·
  <a href="https://pactwright.github.io/docs/quickstart/"><b>Quickstart</b></a> ·
  <a href="https://github.com/Pactwright/pactwright.github.io/actions/workflows/deploy.yml"><b>Deploys</b></a> ·
  <a href="https://github.com/Pactwright/Pactwright-studio/releases/download/v0.1.0-rc.1/brag.mp4"><b>Watch Film (1080p)</b></a>
</p>

<p align="center">
  <a href="https://github.com/Pactwright/Pactwright-studio/releases/download/v0.1.0-rc.1/brag.mp4">
    <img src="https://github.com/Pactwright/Pactwright-studio/releases/download/v0.1.0-rc.1/film-preview.webp" width="100%" alt="Pactwright Launch Film: one agent, four purchases, four endings, each enforced on Stellar testnet">
  </a>
</p>

> 🔊 **Turn sound on.** [Download or watch the full film (1080p, 60 fps, with music & sound)](https://github.com/Pactwright/Pactwright-studio/releases/download/v0.1.0-rc.1/brag.mp4)  
> *Four purchases, four different endings on Stellar testnet: paid pro rata for 3 of 4 pages, refunded for a tortilla recipe, refunded when nobody answered, and half refunded after a dispute.*

## 📖 Overview

Pactwright is escrow, verdicts and receipts for purchases made by AI agents on Stellar. This
repository holds its public face: the landing page and the documentation. It contains no product
code. The code lives in [`Pactwright-contracts`](https://github.com/Pactwright/Pactwright-contracts),
[`Pactwright-Kit`](https://github.com/Pactwright/Pactwright-Kit) and
[`Pactwright-studio`](https://github.com/Pactwright/Pactwright-studio).

## ⚙️ What is on the site

| Path | What |
|---|---|
| [`src/pages/index.astro`](src/pages/index.astro) | The landing page |
| [`src/content/docs/docs/quickstart.md`](src/content/docs/docs/quickstart.md) | Quickstart |
| [`src/content/docs/docs/concepts/`](src/content/docs/docs/concepts) | Pacts, modes, receipts, trust, the verifier |
| [`src/content/docs/docs/guides/`](src/content/docs/docs/guides) | Agent, seller, verifier and certificates |
| [`src/content/docs/docs/reference/`](src/content/docs/docs/reference) | Configuration, contract, deployments, hashing, packages, verifier API |
| [`src/content/docs/docs/project/`](src/content/docs/docs/project) | Status, contributing, licenses |

## ✏️ Edit a page

Docs pages are Markdown under [`src/content/docs/docs/`](src/content/docs/docs). Every page on the
site also has an **Edit page** link that opens its file here.

Keep the docs true to the code: when a page states a value (a contract ID, a variable name, a
default), it should match the repository it describes. If you change behaviour in one of the code
repositories, update the matching page here in the same change.

## 🚀 Run it locally

Requires Node.js 24 and pnpm.

```bash
pnpm install
pnpm dev            # http://localhost:4321
pnpm build          # the static site, in dist/
pnpm check-links    # after a build: every internal link and #anchor must resolve
```

## ⚙️ How it is built and deployed

- [Astro](https://astro.build) with [Starlight](https://starlight.astro.build) for the docs; search
  is built in (Pagefind).
- The look is shared with Studio: a web3 base (dark block grid, frosted glass panels, solid teal and
  indigo, no gradients) that keeps the pieces carrying meaning tactile, namely the seal, neon state
  stamps and the pact as a chain of blocks. [`src/styles/tokens.css`](src/styles/tokens.css) holds
  the tokens, [`docs.css`](src/styles/docs.css) themes Starlight,
  [`landing.css`](src/styles/landing.css) styles the landing page. Fonts (Unbounded, Manrope,
  JetBrains Mono) are self-hosted.
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds the site, checks every
  internal link, and publishes it to GitHub Pages on each push to `main`. Pull requests get the
  build and the link check.

## 🤝 Community & Maintainers

Join the discussion and get support:

- **Discord**: [discord.gg/4WFU6fwPe](https://discord.gg/4WFU6fwPe)
- **Telegram**: [t.me/Pactwright](https://t.me/Pactwright)

Content bugs and broken links are welcome as
[issues](https://github.com/Pactwright/pactwright.github.io/issues).

## License

[MIT](LICENSE).

```text
Copyright (c) 2026 Pactwright contributors
```

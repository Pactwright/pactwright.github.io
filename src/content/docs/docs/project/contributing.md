---
title: Contributing
description: How changes are made across the Pactwright repositories.
---

Each repository has a `CONTRIBUTING.md` and an `AGENTS.md` with the full rules. The essentials:

## Every pull request updates the roadmap

Each repository has a `ROADMAP.md` that tracks every task. A pull request must update it: the status of the task it touches, the progress counts, and one line in the update log. A CI check (`roadmap`) fails without it. If no task matches your change, add one.

## Before you build

Read `ARCHITECTURE_ESSENTIALS.md` first. It lists the rules no change may break, including:

- There is no admin path to pact funds.
- Two protection modes only: exact refund (M0) and escrow (M2).
- Two deadlines, verdict and settle; never a single expiry.
- One attestation per pact.
- Hashing lives only in `hashing.rs` and `hashing.ts`, tested against the shared vectors.
- Amounts are `i128` stroops on-chain and decimal strings in TypeScript, converted only in `amounts.ts`.
- Every contract entrypoint has a budget test, and the cost lint must pass.

A change to behaviour described in the design documents needs an ADR (architecture decision record) in `docs/adr/` before the code.

## Review

`main` is protected in each repository: pull requests need an approving review and green checks. Some paths are core-team only and need a core review: the contract's `lifecycle.rs`, `verdict.rs`, `meter.rs` and `hashing.rs`, the verifier's `sign.ts`, and the facilitator's `pact` scheme validation.

## This site

This site is [`Pactwright/pactwright.github.io`](https://github.com/Pactwright/pactwright.github.io). Every page has an "Edit page" link. Pages are Markdown in `src/content/docs/docs/`, and the site rebuilds and deploys on every push to `main`.

Report security issues privately, as each repository's `SECURITY.md` describes.

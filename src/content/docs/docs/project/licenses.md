---
title: Licenses and credits
description: How each repository is licensed, and the projects Pactwright builds on.
---

| Repository | License |
|---|---|
| [Pactwright-contracts](https://github.com/Pactwright/Pactwright-contracts) | MIT |
| [Pactwright-Kit](https://github.com/Pactwright/Pactwright-Kit) | Apache-2.0 |
| [Pactwright-studio](https://github.com/Pactwright/Pactwright-studio) | MIT |
| This site | MIT |

The Kit is Apache-2.0 because it vendors [Witness core](https://github.com/fabian416/witness), which is Apache-2.0; one set of terms then covers the whole repository, with an explicit patent grant. The other repositories contain no Apache-2.0 code.

All of it comes with **no warranty**. This code moves money and decides who gets paid; if you run it, the risk is yours.

## Built on

| Project | What Pactwright uses | How |
|---|---|---|
| [Witness](https://github.com/fabian416/witness) | `verdict-v1` envelopes, criteria and reason codes; "the model reads, code decides" | Witness core, vendored unmodified |
| [Accensa](https://github.com/accensa) | `ReceiptAnchor`, `RefundVault`, and the x402 facilitator | Pinned contract WASM; the `pact` scheme contributed to its facilitator |
| [Tollcraft](https://github.com/Tollcraft) | Per-call cost budgets | Budget tests and cost lint in the contract's CI |
| [Vespi](https://github.com/andresanemic/vespi) | Human approval of agent spending | Spending-gate adapter |
| [BookerBob](https://github.com/hustle1hustle/bookerbob-hackmeridian-2026) | Proven-customer reputation | Reputation adapter (planned) |
| [Ficha](https://github.com/beto-rocha-blockchain/ficha-stellar) | Refunding unused units | The idea behind metered sessions; no code |
| [Pollar](https://docs.pollar.xyz) | Seedless wallets | Wallet adapter, through its public SDK only |

Each repository's `NOTICE` file credits these projects in full.

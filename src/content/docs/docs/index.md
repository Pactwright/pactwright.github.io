---
title: What is Pactwright?
description: Escrow, verdicts and receipts for purchases made by AI agents on Stellar.
---

AI agents can already pay for things over HTTP. With [x402](https://developers.stellar.org/docs/build/agentic-payments/x402), a seller answers `402 Payment Required`, the agent pays in USDC on Stellar and retries. That covers paying. It doesn't cover what happens when the purchase goes wrong: the translation comes back in the wrong language, half the pages are missing, or nothing arrives at all. An agent has no one to call, so the rules for getting the money back have to be part of the payment.

Pactwright makes each purchase a **pact**:

1. Before paying, the buyer and seller agree on a **condition**, for example "a Portuguese translation of at least 4 pages". Only its hash goes on-chain, so it can't change later.
2. The buyer locks a **cap**, the most it will pay, in a Soroban contract.
3. The seller delivers and signs a **receipt** over the exact bytes it delivered.
4. A **verifier** checks the delivery against the condition. A model reads the delivery; plain, deterministic rules decide. The verifier signs the verdict.
5. The contract pays the seller what the verdict allows and returns the rest to the buyer. If the verifier or the seller goes silent, deadlines return the money automatically.
6. The outcome becomes a **receipt** anchored on-chain, so anyone can check later what was paid and why.

## The pieces

| Repository | What it is | License |
|---|---|---|
| [Pactwright-contracts](https://github.com/Pactwright/Pactwright-contracts) | The `pact` escrow contract (Rust, Soroban), its tests and the hashing test vectors | MIT |
| [Pactwright-Kit](https://github.com/Pactwright/Pactwright-Kit) | TypeScript: the agent SDK, seller middleware, MCP tools, CLI, and the verifier service | Apache-2.0 |
| [Pactwright-studio](https://github.com/Pactwright/Pactwright-studio) | The public record: indexes pacts, anchors receipts, shows each pact's timeline and checks certificates | MIT |

Payments go through [Accensa's x402 facilitator](https://github.com/accensa/x402-facilitator-stellar), which has a `pact` scheme for opening escrow.

## Where things stand

Pactwright runs on **Stellar testnet**. The contract, the verifier, the facilitator and Studio are deployed there, and every scenario (allow, deny, partial delivery, silence, disputes, metered use) has run as real testnet transactions. It is **not audited**, nothing is on npm yet, and there is no mainnet deployment. [Status and evidence](/docs/project/status/) has the details and the transaction links.

## Where to go next

- **New here?** Read [A pact, step by step](/docs/concepts/lifecycle/), then try the [Quickstart](/docs/quickstart/).
- **Selling an API?** [Sell behind a pact](/docs/guides/seller/).
- **Building an agent?** [Buy as an agent](/docs/guides/agent/).
- **Checking our claims?** [Who you have to trust](/docs/concepts/trust/) and [Testnet deployments](/docs/reference/deployments/).

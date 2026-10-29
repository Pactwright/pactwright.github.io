---
title: A pact, step by step
description: How one purchase moves from terms to payment to receipt, and every way it can end.
---

An agent buys a document translation for at most **1 USDC**. The seller is paid by the page: four pages were ordered.

## The happy path

1. **Terms.** The agent requests the translation. The seller answers `402 Payment Required` with its terms: the condition ("Portuguese, at least 4 pages"), the verifier that will judge, and the deadlines. The agent can read all of this before paying anything.
2. **Open.** The agent calls `open` on the `pact` contract. The contract checks the cap and the deadlines, checks that buyer and seller differ, moves 1 USDC into escrow, and records which verifier key will judge this pact. Only the condition's hash is stored, so the terms can't change afterwards.
3. **Delivery.** The seller sends the document with a signature over its exact bytes. Neither side can later pretend something else was delivered.
4. **Verdict.** The buyer sends the delivery to the verifier as evidence. The verifier reads it, applies deterministic rules and signs an attestation: here, ALLOW 0.75 USDC, because only 3 of 4 pages arrived. Anyone can submit the attestation to the contract; the signature is what counts.
5. **Settle.** The seller collects 0.75 USDC. In the same transaction, the contract returns 0.25 USDC to the agent.
6. **Receipt.** The outcome is hashed into a receipt and anchored on-chain with others in a batch, so the agent can later prove what it paid for.

If the verifier had said **DENY**, step 5 would be a `release` instead, and the agent would get the full 1 USDC back.

## States

Every pact is in exactly one of these states, and ends in exactly one of the last two.

| State | Means | How it gets there |
|---|---|---|
| **Funded** | The cap is in escrow, waiting for a verdict | `open` |
| **Allowed** | The verifier approved an amount; the seller can collect | `record_verdict` with ALLOW |
| **Denied** | The verifier rejected the delivery | `record_verdict` with DENY |
| **Settled** | The seller was paid; any remainder went back to the buyer | `settle`, or `close_meter` for metered pacts |
| **Released** | The whole cap went back to the buyer | `release` |

In both final states, the amount paid to the seller plus the amount returned to the buyer equals the cap. The contract's tests enforce this as one of eight [invariants](/docs/reference/contract/#invariants).

## Deadlines and silence

A pact has **two** deadlines, both counted in ledgers. A Stellar ledger closes about every 5 seconds.

- **Verdict deadline**: the last ledger at which a verdict can be recorded.
- **Settle deadline**: the last ledger at which the seller can collect.

When the pact opens, the buyer and seller also agree on a **silence policy**: what happens if no verdict arrives by the verdict deadline.

| Silence policy | If the verdict deadline passes with no verdict |
|---|---|
| `Refund` (the default) | Anyone can call `release`, and the buyer gets the whole cap back |
| `Pay` | The seller can collect, as if the delivery had been approved |

The Kit's default deadlines for translations are 120 ledgers (about 10 minutes) for the verdict and 720 ledgers (about an hour) to settle.

## Every way a pact can end

| What happens | Outcome |
|---|---|
| The delivery is right | ALLOW for the full cap; the seller settles |
| Only part was delivered | ALLOW for a smaller amount; the seller settles that, the rest returns |
| The delivery is wrong | DENY; anyone calls `release`, and the buyer gets everything back |
| The seller never delivers | No verdict arrives. Under `Refund`, anyone can `release` after the verdict deadline |
| The verifier goes offline | Same as above: the silence policy applies at the verdict deadline |
| The seller never collects | After the settle deadline, anyone can `release`, so the money isn't stuck |
| Someone submits a second verdict | Rejected: a pact accepts exactly one |
| A verdict for another pact is replayed | Rejected: each attestation is bound to one pact and one condition |

Nobody's permission is needed to get money back: `release` can be called by anyone once its conditions are met, and it can only pay the buyer.

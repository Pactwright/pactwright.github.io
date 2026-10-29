---
title: Receipts and certificates
description: How every finished pact becomes a receipt anyone can verify, without trusting a server.
---

When a pact finishes, the agent should be able to prove what happened without relying on the seller's server, or on Pactwright's. That's what receipts are for.

## Receipts

Each final transition (paid, settled, released, refunded) produces a **receipt leaf**: a SHA-256 hash over the pact ID, the transition, the amounts to the seller and to the buyer, the verdict envelope's hash (or zero) and the ledger. The exact layout is in [Hashes and signed messages](/docs/reference/hashing/).

## Anchoring

Studio collects receipt leaves into batches of up to 1,000, builds a Merkle tree over each batch (sorted-pair SHA-256, the same format as [Accensa's `ReceiptAnchor`](https://github.com/accensa)), and anchors the batch's root on-chain with `anchor_batch`. On testnet this runs every hour.

Before anchoring, the anchorer reconciles from the chain: it rebuilds what should be anchored from contract events, not from its own database, so a database problem can't make it anchor something false.

## Certificates

A **certificate** is a receipt plus what's needed to check it: the leaf, its Merkle proof and the batch root. It has two states:

| Status | Means |
|---|---|
| `pending` | The pact has finished, but its batch hasn't been anchored yet |
| `anchored` | The batch root is on-chain, and the proof links this receipt to it |

To check a certificate, hash up from the leaf through the proof and compare the result with the anchored root. Studio's [certificate viewer](/docs/guides/certificates/) does this in your browser; `ReceiptAnchor.verify_receipt` does it on-chain. Both give the same answer, and neither needs you to trust Studio.

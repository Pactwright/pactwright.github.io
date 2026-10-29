---
title: Check a certificate
description: Verify that a receipt belongs to its anchored batch, in your browser or on-chain.
---

A certificate proves that a pact ended the way it says it did. You don't need to trust whoever gave it to you.

## In Studio

Open Studio's [certificate viewer](https://pactwright-studio-testnet.onrender.com/verify), paste the certificate JSON and choose **Inspect & Verify**. The check runs in your browser; nothing is sent anywhere.

| Result | Means |
|---|---|
| **Verified (Offline Merkle Proof)** | The receipt's leaf hashes up through the proof to the anchored root: this receipt is in that batch |
| **Invalid Merkle Proof** | The proof doesn't lead from the leaf to the root. The certificate was altered, or belongs to another batch |
| **Pending Anchor** | The pact has finished, but its batch hasn't been anchored yet. Batches are anchored hourly on testnet |

## What's in a certificate

```json
{
  "pactId": "…",
  "transition": "settled",
  "toSeller": "1.0000000",
  "toBuyer": "0.0000000",
  "leaf": "…",
  "proof": ["…", "…"],
  "root": "…",
  "status": "anchored"
}
```

| Field | What it is |
|---|---|
| `pactId` | The pact the receipt is for |
| `transition` | How it ended: `paid`, `settled`, `released` or `refunded` |
| `toSeller`, `toBuyer` | Where the money went, in USDC |
| `leaf` | The receipt hash. [How it's computed](/docs/reference/hashing/#receipts) |
| `proof` | The sibling hashes from the leaf up to the root |
| `root` | The batch's Merkle root, anchored on-chain |
| `status` | `pending` or `anchored` |

## On-chain

The same check runs on-chain as `verify_receipt` on the `ReceiptAnchor` contract (`CAEO5GBC…NJ2` on testnet). The Kit's `verifyProof` and the CLI's `pactwright verify` give the same answer as the contract.

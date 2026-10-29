---
title: Hashes and signed messages
description: The exact byte layout of pact IDs, signed messages and receipts.
---

Every hash and signed message is computed identically in Rust (`hashing.rs`) and TypeScript (`hashing.ts`). Both are tested against the published vectors in [`Pactwright-contracts/test-vectors`](https://github.com/Pactwright/Pactwright-contracts/tree/main/test-vectors); `cargo test` fails if they drift.

**Encoding:** `xdr(x)` is the Soroban `ScVal` XDR of `x`; integers are big-endian; `‖` is concatenation. ed25519 signatures are over the 32-byte digest.

## Identifiers

```text
nonce   = u64_be( sha256(idempotency_key)[0..8] )
pact_id = sha256( xdr(buyer) ‖ xdr(seller) ‖ nonce ‖ condition_hash )
```

Because the buyer's address is part of `pact_id` and `open` requires the buyer's signature, nobody can open a pact under someone else's ID. The same idempotency key always gives the same pact, so a retried purchase can't pay twice.

## Signed messages

Each signature uses its own domain prefix, so one kind of signature can never be replayed as another.

| Message | Signed by | Digest |
|---|---|---|
| Verdict | Verifier | `sha256("pactwright-verdict-v1:" ‖ xdr(VerdictAttestation))` |
| Usage voucher | Buyer's meter key | `sha256("pactwright-usage-v1:" ‖ xdr(UsageVoucher))` |
| Delivery receipt | Seller's delivery key | `sha256("pactwright-delivery-v1:" ‖ pact_id ‖ sha256(body))` |

A `VerdictAttestation` contains the `pact_id`, the condition hash, the envelope hash, the verdict, the amount and `issued_ledger`. The contract accepts it only if `opened_ledger ≤ issued_ledger ≤ now`.

## Receipts

```text
leaf = sha256( "pactwright-receipt-v1" ‖ pact_id ‖ transition ‖ to_seller ‖ to_buyer ‖ (envelope_hash or 0) ‖ ledger )
```

There is one leaf per final transition: `paid`, `settled`, `released` or `refunded`. Leaves are combined with **sorted-pair SHA-256** into a Merkle tree, the same format as Accensa's `ReceiptAnchor` and `verifyReceipt()`.

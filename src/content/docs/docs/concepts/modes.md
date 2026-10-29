---
title: Protection modes
description: M0 exact refund, M2 escrow, and metered pacts, and when to use each.
---

Pactwright gives buyers two levels of protection, plus a pay-per-use variant of the stronger one. The seller chooses the mode per route; the agent sees it in the terms before paying.

| | M0: exact refund | M2: escrow | Metered (M2) |
|---|---|---|---|
| Where the money waits | Paid to the seller straight away | Locked in the `pact` contract | Locked in the `pact` contract |
| What decides the payout | A verifier's verdict; the seller refunds from its `RefundVault` | A verifier's signed verdict | The buyer's own signed usage |
| Needs the seller's cooperation | **Yes** | No | No |
| Best for | Cheap, high-volume calls from sellers you already trust | Larger or one-off purchases, new sellers | Minutes, pages or calls consumed over a session |
| x402 scheme | `exact` | `pact` | `pact` |

## M0: exact refund

The agent pays the seller directly with the standard x402 `exact` scheme. If the verifier denies the delivery, or allows only part of it, the seller's middleware refunds the difference from the seller's [Accensa `RefundVault`](https://github.com/accensa), within an agreed refund window.

M0 is cheap and fast, but the refund depends on the seller: on its vault having funds and its software running. **It is not a guarantee.** Use it where the amounts are small and the seller has a record.

## M2: escrow

The cap goes into the `pact` contract when the pact opens, and only a verdict, the deadlines and the silence policy decide where it goes next. The seller can't collect more than the verdict allows, and the buyer can't take the money back outside the release rules. Protection holds in both directions without trusting either party. This is the mode the contract implements, and the one to use for anything that matters.

## Metered

A metered pact is an escrow pact with a unit price, for things consumed over time, such as minutes of GPU time. There is no verifier. As the agent consumes, it signs **usage vouchers**: "usage so far: 500 units". When the session ends, the seller calls `close_meter` with the latest voucher and is paid `units × unit price`; the rest of the cap returns to the agent in the same transaction.

The seller can only be paid for usage the buyer signed for, and never more than the cap.

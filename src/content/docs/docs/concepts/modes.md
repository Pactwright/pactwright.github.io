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

## Worked numbers

Amounts on-chain are stroops of USDC: 1 USDC = 10,000,000 stroops. The first three rows are real pacts from the testnet run on 2026-10-29; the last is arithmetic for a metered session.

| Case | Mode | Cap | Verdict or usage | Seller gets | Buyer gets back | Transaction |
|---|---|---|---|---|---|---|
| 3 of 4 pages delivered | M2 | 1.00 USDC | ALLOW 0.75 (pro rata) | 0.75 | 0.25 | [`18ea30d9…`](https://stellar.expert/explorer/testnet/tx/18ea30d9838dbbaa774aeffc44c55abc91e79fc69659fcc81b73fda4f2b05496) |
| Wrong delivery | M2 | 1.00 USDC | DENY | 0.00 | 1.00 | [`eae7c711…`](https://stellar.expert/explorer/testnet/tx/eae7c7118268818c9ff700a724647c0713295bd74e945f89f9c1aece572c7bcc) |
| Paid, then disputed: 2 of 4 pages | M0 | 1.00 USDC paid | re-verified: 2 of 4 | 0.50 (keeps) | 0.50 from the seller's `RefundVault` | [`79d22019…`](https://stellar.expert/explorer/testnet/tx/79d22019715f76cd500b85c1581415cad02878ec44d623fd5d35666a83b014b6) |
| GPU session, 1,200 minutes | Metered | 5.00 USDC | voucher: 1,200 units × 0.002 USDC | 2.40 | 2.60 | — (example) |

The pro rata rule is `cap × pages delivered / pages required`, floored to a stroop: `10,000,000 × 3 / 4 = 7,500,000` stroops, 0.75 USDC. A metered pact pays `min(units × unit price, cap)`, so a voucher for 3,000 units would still pay at most the 5.00 USDC cap.

Running a pact costs network fees on top, paid in XLM, not USDC. On testnet a partial `settle` (two transfers, the worst case) charged 12,059 stroops of XLM, 0.0012 XLM ([benchmarks](https://github.com/Pactwright/Pactwright-contracts/blob/main/docs/BENCHMARKS.md)). With the facilitator sponsoring fees, the buyer needs only USDC.

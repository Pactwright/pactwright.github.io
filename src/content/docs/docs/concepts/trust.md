---
title: Who you have to trust
description: What each party can and cannot do, the protections behind that, and the known limits.
---

The short answer: the buyer trusts only the verifier named in the pact, and the seller trusts the same verifier to have checked honestly. Neither has to trust the admin or the other party.

## What each party can do

| Party | Can | Cannot |
|---|---|---|
| **Buyer** | Open a pact (locking its own money); sign usage vouchers for metered pacts | Take the escrow back outside the release rules |
| **Seller** | Collect up to the allowed amount; close a meter for the signed usage | Collect more than the verdict or the usage allows |
| **Verifier** | Sign one verdict per pact | Move funds; change a pact |
| **Admin** | Change the verifier key for **new** pacts | Move funds; change any open pact |
| **Anyone** | Submit a valid verdict; call `release` when allowed; keep a pact's storage alive | Send funds anywhere but to the buyer or the seller |

There is **no admin path to funds**. That isn't a policy; the contract has no function that could do it, and a named test checks that none exists.

## The protections

| Threat | Protection |
|---|---|
| A forged or replayed verdict | The verifier signs over a domain-separated hash, bound to one pact ID, one condition hash and a ledger within the pact's life |
| Two conflicting verdicts | Only the first valid verdict lands; the pact must still be `Funded` |
| The verifier key leaks | The admin rotates it for new pacts. Open pacts are exposed only until their verdict deadline, so short deadlines limit the damage |
| The seller overcharges | `settle` caps the amount at the verdict; `close_meter` caps it at signed units × unit price, and never above the cap |
| The seller or verifier disappears | `release` returns the escrow after the silence or settle deadline; funds can't be stranded |
| Contract storage expires with funds inside | `open` extends the pact's storage past the settle deadline and rejects deadlines too far out |
| Someone opens a pact with your ID | The pact ID hashes the buyer's address, and `open` requires the buyer's signature |

## Known limits

- **Not audited.** The contract runs on testnet only until an audit.
- **M0 refunds depend on the seller.** Exact-refund mode pays the seller first; a refund needs the seller's vault and software. Use escrow when that matters.
- **A frozen account can't be refunded.** If the USDC issuer freezes the buyer's trustline, `release` can't pay it, and the funds wait in escrow until the freeze lifts.
- **The admin key can't be changed** in this version. Losing it only blocks verifier rotation; it never affects funds.

To report a vulnerability, follow each repository's `SECURITY.md`; don't open a public issue.

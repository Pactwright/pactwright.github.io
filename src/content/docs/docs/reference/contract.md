---
title: Contract API
description: The pact contract's entrypoints, errors, events and invariants.
---

The `pact` contract is written in Rust for Soroban (`soroban-sdk` 28). Source: [Pactwright-contracts/contracts/pact](https://github.com/Pactwright/Pactwright-contracts/tree/main/contracts/pact). Amounts are in stroops of the payment token: USDC has 7 decimals, so `10_000_000` is 1 USDC.

## Entrypoints

| Function | Who calls it | What it does |
|---|---|---|
| `__constructor(admin, token, verifier, max_pact_ledgers)` | Deployer, once | Sets the admin, the payment token, the first verifier key and the longest pact allowed |
| `open(params) → pact_id` | Buyer | Locks `cap` in escrow, records the verifier key, the deadlines and the silence policy |
| `record_verdict(pact_id, attestation, signature)` | Anyone | Records the single ALLOW or DENY verdict after checking the verifier's signature |
| `settle(pact_id, actual)` | Seller | Pays `actual` (at most the allowed amount) to the seller and returns the rest to the buyer |
| `close_meter(pact_id, units, signature)` | Seller | Pays `units × unit_price` from the buyer's signed voucher and returns the rest |
| `release(pact_id)` | Anyone | Returns the whole cap to the buyer when the release rules allow it |
| `set_verifier(key)` | Admin | Changes the verifier key for pacts opened afterwards |
| `get_pact(pact_id)`, `get_config()` | Anyone | Reads a pact or the contract's configuration |
| `extend_pact_ttl(pact_id)` | Anyone | Keeps an open pact's storage alive |

### `open` parameters

| Field | Type | Meaning |
|---|---|---|
| `buyer`, `seller` | `Address` | Must differ. The buyer signs |
| `cap` | `i128` | The most the buyer can pay; must be above zero |
| `nonce` | `u64` | From the buyer's idempotency key |
| `condition_hash` | `BytesN<32>` | The hash of the frozen condition |
| `meter` | `Metering` | `None`, or `Units { unit_price, meter_key }` for metered pacts |
| `silence` | `Silence` | `Refund` or `Pay` |
| `verdict_deadline`, `settle_deadline` | `u32` | Ledgers. Verdict first; neither beyond `max_pact_ledgers` or the network's storage limit |

### When `release` is allowed

`release` succeeds, and pays only the buyer, when any of these holds:

- the pact is `Denied`;
- the silence policy is `Refund`, the pact is still `Funded`, and the verdict deadline has passed;
- the pact is `Funded` or `Allowed`, and the settle deadline has passed.

## Errors

A failed call returns `Error(Contract, #n)`.

| # | Name | Meaning |
|---|---|---|
| 1 | `NotInitialized` | The contract has no configuration |
| 2 | `AlreadyExists` | A pact with this `pact_id` already exists |
| 3 | `PactNotFound` | No pact with this `pact_id` |
| 4 | `InvalidState` | The pact isn't in a state that allows this call |
| 5 | `InvalidAmount` | Zero, negative, or above the cap or the allowed amount |
| 6 | `SelfDealing` | Buyer and seller are the same address |
| 7 | `BadDeadlines` | Deadlines are in the past, out of order, or too far out |
| 8 | `VerdictWindowClosed` | The verdict deadline has passed |
| 9 | `SettleWindowClosed` | The settle deadline has passed |
| 10 | `NotReleasable` | The release conditions aren't met yet |
| 11 | `AttestationMismatch` | The attestation is for another pact or condition, or its ledger is outside the pact's life |
| 12 | `BadSignature` | Reserved. A bad signature aborts the transaction instead, because `ed25519_verify` traps |
| 13 | `NotMetered` | `close_meter` on a pact without metering |
| 14 | `IsMetered` | A verdict or `settle` on a metered pact |
| 15 | `Unauthorized` | The caller isn't allowed to do this |

## Events

Every event has the topics `("pact", <name>)`. Studio's indexer reads these.

| Event | Emitted by | Fields |
|---|---|---|
| `opened` | `open` | `pact_id`, `buyer`, `seller`, `cap`, `condition_hash`, `metered`, `silence`, `verdict_deadline`, `settle_deadline` |
| `verdict` | `record_verdict` | `pact_id`, `verdict` (Allow = 1, Deny = 2), `amount`, `envelope_hash` |
| `settled` | `settle` | `pact_id`, `to_seller`, `to_buyer` |
| `meter_closed` | `close_meter` | `pact_id`, `units`, `to_seller`, `to_buyer` |
| `released` | `release` | `pact_id`, `reason` (Denied = 1, Silence = 2, Deadline = 3), `to_buyer` |
| `verifier_set` | `set_verifier` | `key` |

Exactly one of `settled`, `meter_closed` or `released` is emitted per pact, and its amounts add up to the cap. Event topics are a public interface: changing one is a breaking change.

## Invariants

Each is enforced by a named test in `test/invariants.rs`, plus fuzzing where noted. Run them with `cargo test invariant`.

| # | Invariant |
|---|---|
| 1 | A pact reaches exactly one terminal state, `Settled` or `Released` |
| 2 | At the terminal state, paid to seller + returned to buyer = cap (also fuzzed) |
| 3 | The contract's token balance equals the sum of caps over open pacts |
| 4 | No entrypoint lets the admin move funds or change an open pact |
| 5 | An attestation is bound to one `pact_id` and condition hash; a second `record_verdict` fails |
| 6 | `set_verifier` never affects an already-open pact |
| 7 | `settle` and `close_meter` never succeed after the settle deadline; `release` never succeeds for an `Allowed` pact before it |
| 8 | Metered pacts never accept a verdict; verdict pacts never accept `close_meter` |

## Cost

Measured on real testnet transactions; fees in XLM.

| Call | CPU instructions | Fee |
|---|---|---|
| `open` | 1.07M | 0.0181 (includes storage rent) |
| `record_verdict` | 1.65M | 0.0009 |
| `settle` | 1.19M | 0.0012 |
| `release` | 1.03M | 0.0009 |
| `close_meter` | 2.04M | 0.0013 |

Every call stays under 2.1% of a transaction's CPU limit. CI fails if a change pushes any call past its recorded budget.

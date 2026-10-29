---
title: The verifier
description: The model reads, code decides. How a delivery becomes a signed verdict.
---

The verifier answers one question: did the delivery meet the condition the buyer and seller agreed on before payment? Its design follows one rule, taken from [Witness](https://github.com/fabian416/witness): **the model reads, code decides.**

## How a verdict is made

1. **Check the receipt.** The verifier confirms the seller signed the delivery, and that the delivered bytes are among the evidence. Evidence is fetched only from the configured evidence store, and each file's SHA-256 must match.
2. **The model reads.** A language model turns the delivery into a small structured reading, such as `{ detectedLanguage, pageCount, isTranslationOfSource, untranslatedSegments }`. It doesn't decide anything.
3. **Code decides.** A pure function turns that reading and the frozen condition into ALLOW or DENY, plus an amount. The same inputs always give the same verdict, so anyone can re-run the rules on the stored reading.
4. **Sign and keep.** The verdict is a Witness `verdict-v1` envelope: the criteria, reason codes, model ID, policy version and a hash of the model's raw output, signed with the verifier's key. For escrow pacts, the verifier also signs one on-chain **attestation**, stamped with the current ledger.

If the model refuses or can't produce a reading, there is **no verdict**. The verifier doesn't guess; the pact falls back to its silence policy, which by default refunds the buyer.

## Example: a translation

The condition, frozen before payment:

```json
{ "kind": "document.translation", "lang": "pt", "minPages": 4, "maxUntranslatedSegments": 0 }
```

| Criterion | Mandatory | Fails when |
|---|---|---|
| `language` | Yes | The detected language isn't the required one (`pt-BR` counts as `pt`) |
| `is_translation` | Yes | The document isn't a translation of the source |
| `completeness` | Yes | More untranslated segments than allowed |
| `has_pages` | Yes | Nothing was delivered |
| `page_count` | No | Fewer pages than `minPages` |

A failed mandatory criterion means DENY, and the buyer gets everything back. A short delivery is paid pro rata: `cap × pages ÷ minPages`, rounded down. With a 1 USDC cap and 3 of 4 pages, the seller is paid 0.75 USDC.

## How accurate is it?

The verifier's model reading is tested against a labelled set of translation cases (correct translations, wrong languages, the source returned unchanged, unrelated text, untranslated passages, empty deliveries) in eight languages. With Google's `gemini-3.5-flash-lite`, it scored **29 of 29** on 29 October 2026, and CI fails if accuracy drops below 90%.

## Other rules

- **One verdict per pact and milestone.** A second request for the same pact gets `409`, and the contract accepts only one attestation per pact anyway.
- **Non-delivery.** If the seller never produces a delivery receipt, the verifier challenges the seller, and no receipt within the timeout means DENY.
- **Small purchases.** A seller can set `verify.minAmount` on a route. Below it, the purchase gets a receipt but no verification.
- **The model is configurable and recorded.** The provider, model ID and reasoning effort are set by the operator and written into every envelope, so each verdict can be traced to what produced it.

The verifier never holds money. It can only sign verdicts; the contract holds the funds.

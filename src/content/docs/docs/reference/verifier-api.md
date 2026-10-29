---
title: Verifier HTTP API
description: Endpoints, request body and responses of the verifier service.
---

The hosted testnet verifier is at `https://pactwright-verifier-testnet.onrender.com`.

## `GET /health`

```json
{
  "ok": true,
  "verifier": "GBHP3LVWYNHPDOV3ZBCJBGX6K5VSRCRWUKX6IOUL636P7AWJ77SP7TDT",
  "verifierHex": "4efdaeb6c34ef1babbc844909afe576b288a36a2afe43a8bf6fcff82c9ffe4ff"
}
```

`verifierHex` is the key sellers name in their terms and the `pact` contract checks signatures against.

## `POST /v1/verdicts`

Asks for a verdict on one pact and milestone.

| Field | Required | What it is |
|---|---|---|
| `terms` | Yes | The pact terms: `pactId`, `mode`, `buyer`, `seller`, `cap`, `nonce`, `conditionHash`, `condition`, `verifier`, `deliveryKey`, and so on |
| `evidence` | Yes, at least one | Items of `{ type, uri, sha256, mimeType, uploader, createdAt }`. Each `uri` must resolve under the verifier's evidence store, and the fetched bytes must match `sha256` |
| `deliveryReceipt` | No | The seller's `X-Pactwright-Delivery` value: `sha256=<hex>; sig=<base64>`. Without it, the verifier challenges the seller for one |
| `minAmount` | No | Below this, the purchase gets a receipt only |
| `milestone` | No | `delivery` (default), or `dispute-<n>` for a later dispute |

### Responses

| Status | Body |
|---|---|
| `201` | `{ envelope, envelopeRef, amount, attestation }`. For escrow pacts, `attestation` holds the signed `VerdictAttestation` to submit with `record_verdict` |
| `200` | `{ receiptOnly: true, amount, … }`: below `minAmount`, no verification |
| `202` | `{ verdict: null, reason: "model_refusal" }`: the model refused, so there is no verdict and the silence policy applies |
| `400` | `{ error: "invalid_request", issues }` |
| `409` | `{ error: "verdict_exists", envelopeSha256 }`: this pact and milestone already have a verdict |
| `501` | `{ error: "not_implemented", roadmapTask }`: no rules exist yet for this condition kind |

`envelopeRef` has the form `verdict-v1 sha256=<hex> uri=<where the envelope is served>`.

## `GET /v1/envelopes/:sha256`

Returns a stored verdict envelope, so anyone can re-check a verdict: its criteria, reason codes, model ID, policy version, the hash of the model's raw output, and the verifier's signature. `404` if it isn't stored.

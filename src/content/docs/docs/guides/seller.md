---
title: Sell behind a pact
description: Protect an x402 route with @pactwright/seller, in Express or Hono.
---

`@pactwright/seller` turns an HTTP route into one an agent can buy under a pact. One middleware call answers `402` with your terms, has the facilitator verify and settle the payment before your handler runs, and signs a delivery receipt over exactly what you return.

:::note
The Kit isn't on npm yet. Until it is, depend on it from a clone of [Pactwright-Kit](https://github.com/Pactwright/Pactwright-Kit). The full example below is [`examples/seller-express`](https://github.com/Pactwright/Pactwright-Kit/tree/main/examples/seller-express).
:::

## Configure the seller

The middleware reads its settings from the environment and refuses to start, listing every missing value at once, if any required one is absent. There are no defaults for the payee, the delivery key or the verifier.

| Variable | Required | What it is |
|---|---|---|
| `SELLER_ADDRESS` | Yes | Your Stellar address; payments go here |
| `SELLER_DELIVERY_KEY` | Yes | A 32-byte hex ed25519 seed that signs your delivery receipts. Keep it secret |
| `VERIFIER_PUBLIC_KEY` | Yes | The verifier you name in your terms (32-byte hex). On testnet: `4efdaeb6c34ef1babbc844909afe576b288a36a2afe43a8bf6fcff82c9ffe4ff` |
| `VERIFIER_URL` | Yes | That verifier's URL. On testnet: `https://pactwright-verifier-testnet.onrender.com` |
| `USDC_SAC_ID` | Yes | The USDC contract. On testnet: `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` |
| `FACILITATOR_URL` | Yes | The x402 facilitator. On testnet: `https://pactwright-facilitator-testnet.onrender.com` |
| `FACILITATOR_API_KEY` | If the facilitator requires one | Sent as `Authorization: Bearer …`. The hosted testnet facilitator does require one |
| `PACT_CONTRACT_ID` | For escrow (M2) | The `pact` contract. On testnet: `CDUXJJUNYFILEYHE3LITANJEKCDFERNAABOSG75OWATFVM776BCMFEV6` |
| `SELLER_REFUND_VAULT_ID` | For exact refund (M0) | Your Accensa `RefundVault` |
| `STELLAR_NETWORK` | No | `testnet` (default) or `pubnet` |

## Protect a route

```ts
import express from "express";
import { pact, resolveSellerConfig } from "@pactwright/seller";

const config = resolveSellerConfig();
const app = express();

app.get(
  "/translate",
  pact(
    {
      mode: "exact-refund",
      price: "0.25",
      asset: "USDC",
      // The condition the buyer freezes before paying.
      condition: (req) => ({ kind: "document.translation", lang: req.query.to || "es", minPages: 1 }),
      verify: { minAmount: "0.10" },
      refundWindowLedgers: 17280,
    },
    config,
  ),
  (req, res) => {
    // Runs only after the payment is verified and settled.
    res.json({ translated: "Hola mundo", pages: 1 });
  },
);

app.listen(4000);
```

For Hono, use `pactHono` with the same options.

## Route options

| Option | What it does |
|---|---|
| `mode` | `"exact-refund"` (M0) or `"escrow"` (M2). See [Protection modes](/docs/concepts/modes/) |
| `price` | A decimal USDC amount, such as `"0.25"`. For escrow, it is the cap |
| `asset` | `"USDC"` |
| `condition(req)` | Builds the condition for this request. The buyer freezes its hash before paying, so it can't change afterwards |
| `verify.minAmount` | Below this amount, the purchase gets a receipt but no verification |
| `silence` | Escrow only: `"refund"` (default) or `"pay"`. What happens if no verdict arrives in time |
| `deadlines` | Escrow only: `{ verdictLedgers, settleLedgers }`, counted from `open`. Translations default to 120 and 720 |
| `refundWindowLedgers` | How long, in ledgers, a buyer can dispute after payment |
| `meter` | Escrow only: `{ unit, unitPrice }` for metered sessions |

## What the middleware does on each request

1. **No payment:** answers `402` with an x402 v2 `PAYMENT-REQUIRED` header. Your terms are under `accepts[].extra.pactwright`: the mode, the condition, your delivery key, the verifier, the contract, the deadlines and the silence policy. M0 uses the `exact` scheme, M2 the `pact` scheme.
2. **With payment:** asks the facilitator to verify and settle it. For M2, settling the payment is what opens the escrow. Your handler doesn't run until this succeeds.
3. **Your response:** signs `sha256("pactwright-delivery-v1:" ‖ pact_id ‖ sha256(body))` and returns it in `X-Pactwright-Delivery`.
4. **One serve per pact.** A pact that has been served isn't served again.

## Getting paid

- **Escrow:** once the verdict is recorded, collect with `settle`. The Kit's `handleAutoSettle` hook sends it for you, either directly from your account or through the facilitator's `/pact/submit`, which pays the fee.
- **Exact refund:** you've already been paid. On a DENY or a partial verdict, the `handleM0Refund` hook refunds the difference from your `RefundVault`. Refunds are signed with your seller key, which can live in a KMS such as HashiCorp Vault.

Before going live, run `runStartupChecks()`. It checks that your delivery key and address are well formed, and that your account exists on the network with a USDC trustline.

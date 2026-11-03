---
title: Become a launch seller
description: Put one route behind a pact on testnet, settle a first purchase, and get listed as one of Pactwright's first independent sellers.
---

Pactwright needs its first three sellers from outside the core team. A launch seller runs one paid API route on Stellar testnet behind `@pactwright/seller`. When an AI agent buys from that route and the result doesn't meet the agreed condition, the agent gets its money back automatically.

This page takes you from nothing to a listed route. Budget about an hour.

## What you get

- **Refund protection your buyers can check.** Agents can see your terms before they pay, and a refund doesn't depend on a support ticket.
- **No fees on testnet.** The hosted facilitator pays the transaction fees.
- **A public listing** in the [testnet seller registry](https://github.com/Pactwright/Pactwright-contracts/blob/main/docs/TESTNET_SELLERS.md), with a link to your first settled pact.
- **Direct help** from the maintainers while you set up.

## What counts as onboarded

The registry lists a seller only when anyone can check all four of these:

1. You hold your own key. No maintainer, deployer or facilitator holds it.
2. A public HTTPS endpoint answers `402`, and its terms are under `accepts[].extra.pactwright`.
3. At least one pact with you has reached a final state on the testnet `pact` contract, and there is a transaction link to show it.
4. The endpoint answers when someone checks it.

## Checklist

### 1. Ask for a facilitator key

Open a [seller onboarding request](https://github.com/Pactwright/Pactwright-Kit/issues/new?template=seller-onboarding.yml). Give your route, what it sells and which mode you want. A maintainer will send you a facilitator API key privately. Never post the key in the issue.

### 2. Create your testnet account

```sh
stellar keys generate my-seller --network testnet --fund
stellar keys address my-seller          # your SELLER_ADDRESS
```

Your account needs a USDC trustline before it can be paid:

```sh
stellar tx new change-trust --source-account my-seller --network testnet \
  --line USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

That is Circle's testnet USDC. Its contract is `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`.

### 3. Create a delivery key

```sh
openssl rand -hex 32                    # your SELLER_DELIVERY_KEY; keep it secret
```

The delivery key signs a receipt over every response you serve. Keep it apart from your account key.

### 4. Protect one route

Follow [Sell behind a pact](/docs/guides/seller/) to set the environment variables and wrap a route. Express and Hono are both supported. Start with the mode that fits:

| Your route | Mode |
|---|---|
| You want to be paid up front and refund if the result falls short | `exact-refund` (M0), with an Accensa `RefundVault` |
| You're fine with the money waiting in the contract until the verdict | `escrow` (M2), with no vault to fund |

Use a condition the verifier already understands. Today those are `document.translation` and code review. If your route needs a different kind of condition, say so in your request.

Before you deploy, call `runStartupChecks()`. It confirms that your keys are well formed and that your account has the trustline.

### 5. Deploy and check the 402

Deploy anywhere that serves HTTPS. Then:

```sh
curl -si https://your.host/your-route | grep -i '^payment-required'
```

The header should be there. Your terms are under `accepts[].extra.pactwright`.

### 6. Settle a first purchase

Buy from your own route with the [agent guide](/docs/guides/agent/) and a separate buyer account. You can get testnet USDC from [Circle's faucet](https://faucet.circle.com). Then open the pact in [Studio](https://pactwright-studio.vercel.app) and confirm it reached `Settled` or `Released`.

### 7. Get listed

Open a pull request that adds your row to [`TESTNET_SELLERS.md`](https://github.com/Pactwright/Pactwright-contracts/blob/main/docs/TESTNET_SELLERS.md): your public key, your endpoint, the mode and the transaction link. In the pull request, say how you checked each of the four criteria above.

## When something goes wrong

- **`runStartupChecks()` fails:** it names the setting that is wrong. The usual causes are a missing trustline and a delivery key that isn't 64 hex characters.
- **The facilitator answers `401`:** `FACILITATOR_API_KEY` is missing or wrong.
- **The verifier answers `503`:** the hosted verifier is misconfigured. That's on the maintainers, so comment on your onboarding issue.
- **Anything else:** comment on your onboarding issue with the request and the response. Leave out every key.

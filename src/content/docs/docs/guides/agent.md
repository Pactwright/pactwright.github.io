---
title: Buy as an agent
description: Find a seller, buy under a pact, wait for the verdict and keep the certificate, from code or from an LLM agent's tools.
---

An agent can use Pactwright in three ways: the TypeScript SDK, MCP tools an LLM agent calls itself, or the command line.

:::note
The Kit isn't on npm yet. Until it is, depend on it from a clone of [Pactwright-Kit](https://github.com/Pactwright/Pactwright-Kit). The full example is [`examples/agent-node`](https://github.com/Pactwright/Pactwright-Kit/tree/main/examples/agent-node).
:::

## With the SDK

`@pactwright/agent` covers the whole purchase: **find → buy → await → certificate**.

```ts
import { createPactwright } from "@pactwright/agent";
import { DiscoveryBazaar, GateManual, ReputationIdentity, VerifierWitness, WalletKeypair } from "@pactwright/adapters";
import { Keypair, loadNetworkConfig } from "@pactwright/core";

const wallet = new WalletKeypair(Keypair.fromSecret(process.env.AGENT_SECRET_KEY!));

const pactwright = createPactwright({
  network: loadNetworkConfig(process.env), // refuses to load, listing every problem, if incomplete
  wallet,
  verifierUrl: "https://pactwright-verifier-testnet.onrender.com",
  facilitatorUrl: "https://pactwright-facilitator-testnet.onrender.com",
  adapters: {
    discovery: new DiscoveryBazaar({ listings: [/* sellers you know about */] }),
    reputation: new ReputationIdentity(),
    gate: new GateManual({ maxAutoApproveAmount: "10.00" }), // above this, a human approves
    verifier: new VerifierWitness(),
  },
});

const [listing] = await pactwright.find({ /* what you want to buy */ });

const pact = await pactwright.buy(listing, {
  condition: { kind: "document.translation", lang: "pt", minPages: 4 },
  idempotencyKey: "order-1842", // the same key always gives the same pact, so a retry can't pay twice
});

const outcome = await pactwright.await(pact);              // waits for the verdict and settlement
const certificate = await pactwright.certificate(pact.terms.pactId);
```

### What `buy` checks before paying

- The seller's terms must match its listing, and the condition must match the one you passed. If the seller changes anything, `buy` refuses.
- The pact ID is derived from you, the seller, a nonce from your idempotency key, and the condition's hash, so nobody else can claim it.
- Payment is x402: a signed USDC transfer for exact refund (M0), or a signed `pact.open` for escrow (M2). Your agent signs only authorization entries; the facilitator pays the transaction fee.
- After delivery, `buy` checks the seller's signature over the bytes it received.

### Adapters

The SDK's outside dependencies are pluggable:

| Adapter | Decides | Included |
|---|---|---|
| `Discovery` | Which sellers exist | `DiscoveryBazaar` (a listing set) |
| `Reputation` | How much to trust a seller | `ReputationIdentity` (no scoring) |
| `Gate` | Whether a purchase needs a human | `GateManual` (approve above a limit) |
| `Wallet` | How transactions are signed | `WalletKeypair` |
| `Verifier` | How verdicts are read | `VerifierWitness` |

Agent accounts can be created with **sponsored reserves**, so the agent needs only USDC. Its balance is its spending ceiling: top it up to give it a budget, and stop topping it up to revoke.

## As MCP tools

`@pactwright/mcp` exposes the same flow as tools an LLM agent can call:

| Tool | Does |
|---|---|
| `pactwright_find_sellers` | Searches for sellers for a task |
| `pactwright_buy` | Buys under a pact |
| `pactwright_get_pact` | Reads a pact's state |
| `pactwright_dispute` | Opens a dispute on a delivery |
| `pactwright_get_certificate` | Fetches the receipt certificate |

Metered sessions run in the SDK, not through MCP.

## From the command line

`@pactwright/cli` provides `pactwright agent-create` (a sponsored agent account), `pactwright agent-topup`, `pactwright pact` (inspect a pact) and `pactwright verify` (check a certificate).

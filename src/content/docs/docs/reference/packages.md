---
title: Packages
description: What each package in the Kit is for.
---

All packages live in [Pactwright-Kit](https://github.com/Pactwright/Pactwright-Kit). None is on npm yet; until the first release, depend on them from a clone.

| Package | For | Purpose |
|---|---|---|
| `@pactwright/core` | Everyone | Schemas, hashing, Merkle proofs, exact amounts, network configuration |
| `@pactwright/contracts-client` | Agents, sellers | Typed client for the `pact` contract, generated from its bindings |
| `@pactwright/agent` | Agent builders | The buyer: find, buy, await, certificate; sponsored accounts; metered sessions |
| `@pactwright/seller` | Sellers | `pact()` middleware for Express and `pactHono` for Hono; delivery receipts; refund and settle hooks |
| `@pactwright/mcp` | LLM agents | MCP tools: find sellers, buy, get a pact, dispute, get a certificate |
| `@pactwright/adapters` | Integrators | Pluggable discovery, reputation, spending gate, wallet and verifier |
| `@pactwright/cli` | Operators | `pactwright verify`, `pact`, `agent-create`, `agent-topup` |
| `services/verifier` | Verifier operators | The verifier service |

## Amounts

Amounts are decimal strings in TypeScript and `i128` stroops on-chain. They're converted in exactly one place, `@pactwright/core`'s `amounts.ts`, so a rounding bug can't hide anywhere else.

```ts
import { toStroops, fromStroops, buildTree, verifyProof } from "@pactwright/core";

toStroops("1.25");        // 12500000n  (USDC has 7 decimals)
fromStroops(7500000n);    // "0.75"

const tree = buildTree([leafA, leafB, leafC]);
verifyProof(leafA, tree.proofs.get(leafA)!, tree.root); // true, same as ReceiptAnchor.verify_receipt
```

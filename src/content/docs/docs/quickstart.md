---
title: Quickstart
description: See a real pact on testnet, then build and test the code yourself.
---

Pactwright isn't on npm yet, so you work from the repositories. This page gets you from "what is this?" to running the tests in about ten minutes. You need [Node.js 24](https://nodejs.org), [pnpm](https://pnpm.io), and, for the contract, [Rust](https://rustup.rs) and the [Stellar CLI](https://developers.stellar.org/docs/tools/cli) 28.1.0.

## 1. Look at a real pact

On 29 October 2026 an escrow pact was judged by the hosted verifier and settled on testnet. Open it in Studio:

[`pactwright-studio-testnet.onrender.com/pact/40725564…5c55`](https://pactwright-studio-testnet.onrender.com/pact/4072556402d709463f7cb888a4a9e03b061d906f0b7ca5c49ebb2eec4e7d5c55)

You'll see the three steps it went through: **opened** (1 USDC locked), **verdict** (ALLOW 1 USDC, signed by the verifier), **settled** (1 USDC to the seller). Each step links to its transaction on Stellar Expert. The hosted services run on a free tier, so the first page can take up to a minute to load.

## 2. Read the contract's configuration

This is a read-only simulation: it costs nothing and needs only a funded testnet identity in your Stellar CLI.

```bash
stellar contract invoke --network testnet --source <your-identity> --send=no \
  --id CDUXJJUNYFILEYHE3LITANJEKCDFERNAABOSG75OWATFVM776BCMFEV6 -- get_config
```

The result shows the admin, the payment token (testnet USDC), the verifier's public key and the longest pact allowed. [Testnet deployments](/docs/reference/deployments/) lists what each value should be.

## 3. Build and test each repository

```bash
# The contract: invariants, deadlines, fuzzing, budgets, integration with Accensa's contracts
git clone https://github.com/Pactwright/Pactwright-contracts.git
cd Pactwright-contracts && scripts/build.sh && cargo test
cd ..

# The Kit: SDK, seller middleware, verifier
git clone https://github.com/Pactwright/Pactwright-Kit.git
cd Pactwright-Kit && pnpm install && pnpm typecheck && pnpm test
cd ..

# Studio
git clone https://github.com/Pactwright/Pactwright-studio.git
cd Pactwright-studio && pnpm install && pnpm test
```

`scripts/build.sh` prints the contract's WASM hash. It should be `748b5dbc…5d1a4`, the same bytes as the deployed contract. [Verify it yourself](/docs/reference/deployments/#check-the-deployed-bytes) shows how to compare.

## 4. Run a purchase on testnet

The Kit's end-to-end suite opens real pacts on testnet and drives them to the end. Running all scenarios needs the verifier's secret key, so maintainers run it in CI every night. Anyone can trigger and watch it on GitHub, and read the results:

- Workflow: [`e2e-testnet.yml`](https://github.com/Pactwright/Pactwright-Kit/actions/workflows/e2e-testnet.yml)
- Latest report: [`e2e/testnet/results/`](https://github.com/Pactwright/Pactwright-Kit/tree/main/e2e/testnet/results)

## Next

- Understand what just happened: [A pact, step by step](/docs/concepts/lifecycle/).
- Sell something: [Sell behind a pact](/docs/guides/seller/).
- Buy something: [Buy as an agent](/docs/guides/agent/).

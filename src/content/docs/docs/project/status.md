---
title: Status and evidence
description: What works today, what doesn't yet, and the testnet transactions behind each claim.
---

**Pactwright runs on Stellar testnet. It is not audited, not on npm, and not on mainnet.** Everything below links to something you can check.

## What works

| Piece | Status |
|---|---|
| `pact` contract | On testnet. Reproducible build: the release asset, the deployment and a local build are the same bytes |
| Hashing, Rust and TypeScript | Byte-identical, tested against shared vectors |
| Verifier: rules, signing, receipt checks | Working; the contract accepts its signatures on testnet |
| Verifier: model reading | Real model, 29 of 29 on the labelled translation set (`gemini-3.5-flash-lite`, 29 October 2026) |
| Hosted verifier | On testnet; one of its verdicts was accepted by the contract and settled ([below](#the-hosted-verifier)) |
| Seller middleware | On testnet: a valid 402, payments verified and settled by the facilitator before serving, signed delivery receipts |
| Agent purchases over x402 | On testnet, with both `exact` and `pact` schemes |
| Facilitator `pact` scheme | [Merged](https://github.com/accensa/x402-facilitator-stellar/pull/651) in Accensa's facilitator and hosted on testnet |
| Refunds signed in a KMS | A `RefundVault` refund signed by a HashiCorp Vault transit key, on testnet |
| Studio | On testnet: indexes pacts, anchors receipts hourly, shows timelines and checks certificates |

## Not yet

| What | Why |
|---|---|
| Mainnet | Waits for an audit |
| npm packages | The first release is pending |
| Partner integrations (Vespi approvals, Pollar wallets) | The adapters exist and fail safely; they need partner API access |
| Real data on Studio's seller and budget pages | They show sample data until sellers and budgets are registered |

## The hosted verifier

On 29 October 2026, an escrow pact was opened with fresh accounts, the delivery was committed to the evidence store, and the **hosted** verifier judged it with its real model. The contract accepted the verifier's attestation, and the pact settled.

| Step | Ledger | Transaction |
|---|---|---|
| `open` (1 USDC locked) | 5453755 | [`b0103116…`](https://stellar.expert/explorer/testnet/tx/b01031165b23c378d3fa9f5c9befbee0b1a733d944a89e1ce13e17ff290d1a5d) |
| Verdict: ALLOW 1 USDC | issued at 5453756 | |
| `record_verdict` | 5453761 | [`0225f78b…`](https://stellar.expert/explorer/testnet/tx/0225f78b5c3e9b321e1fd5311bc54a61ca9904fa82dbd2b4aeb9f379bc8650db) |
| `settle` | 5453762 | [`1f4ab38c…`](https://stellar.expert/explorer/testnet/tx/1f4ab38c3881892633c2dcf8d7c99c22bc49831d09512eb1b700e62e23e44924) |

The pact in Studio: [`40725564…5c55`](https://pactwright-studio-testnet.onrender.com/pact/4072556402d709463f7cb888a4a9e03b061d906f0b7ca5c49ebb2eec4e7d5c55).

## Every scenario, end to end

The Kit's testnet suite runs every scenario as real transactions against the deployed contract, with real testnet USDC. It runs nightly in CI; these are from its run on 29 October 2026. In this suite the model's reading is a fixture, so the outcomes test the rules, the contract and the payment flow.

| Scenario | Outcome | Step | Transaction |
|---|---|---|---|
| M0 allow | ALLOW, seller keeps 1 | x402 exact payment | [`38509ae3…`](https://stellar.expert/explorer/testnet/tx/38509ae3c467052fe517a7303543efc69e8fc9e1ae32022d31e729df3613b398) |
| M0 deny | DENY, 1 refunded | x402 exact payment | [`1b639eab…`](https://stellar.expert/explorer/testnet/tx/1b639eab020686ab11cf02961c53ae5aa2dc8dbd8afeab7aafc935a76f192bfb) |
| | | `RefundVault.refund` | [`2bc4f53d…`](https://stellar.expert/explorer/testnet/tx/2bc4f53d42160e6b03bdd53e818824c8a8634ad904f4ea2608f99510dbf579a3) |
| M0 non-delivery | DENY, 0.5 refunded | x402 exact payment | [`b3b37888…`](https://stellar.expert/explorer/testnet/tx/b3b378880ea29951cd3185354e6542d6d6c6ec5dcfbe15a5fcdb263373e66441) |
| | | `RefundVault.refund` | [`d9b68052…`](https://stellar.expert/explorer/testnet/tx/d9b68052f92b3c108578d979e7625b9478c4934ca84e213838009100162794bc) |
| M2 allow, partial | ALLOW 0.75 of 1, settled | `open` | [`a774fa79…`](https://stellar.expert/explorer/testnet/tx/a774fa79daa77a4eca3946aa52e137041b2743568ee2f96c9c0ceec1bbe10b6f) |
| | | `record_verdict` | [`15263e7c…`](https://stellar.expert/explorer/testnet/tx/15263e7cfd4b206b350aa3fc97e200e76984f07b7fde4b0dc5ed54d41c009dec) |
| | | `settle` (0.75 to seller, 0.25 back) | [`18ea30d9…`](https://stellar.expert/explorer/testnet/tx/18ea30d9838dbbaa774aeffc44c55abc91e79fc69659fcc81b73fda4f2b05496) |
| M2 deny | DENY, full refund | `open` | [`9a49c8fa…`](https://stellar.expert/explorer/testnet/tx/9a49c8fa14469a8ce788133d42b6d01d1b8091598ff8b13a9d45fe55a43768ce) |
| | | `record_verdict` | [`d53cc633…`](https://stellar.expert/explorer/testnet/tx/d53cc6336940ff01b7af6caab8f39dc8bd12ab43fda8eee76d52e355809e096a) |
| | | `release` | [`eae7c711…`](https://stellar.expert/explorer/testnet/tx/eae7c7118268818c9ff700a724647c0713295bd74e945f89f9c1aece572c7bcc) |
| M2 silence | No verdict; refunded | `open` | [`105581ce…`](https://stellar.expert/explorer/testnet/tx/105581cea5979e0c03a3bc635c2f55ffe8efe5f62a58a078004a597bab621d03) |
| | | `release` after the verdict deadline | [`2a4c579d…`](https://stellar.expert/explorer/testnet/tx/2a4c579d95861cbd4d6ae39e3d6d7956f5083fe5e16df20ee0a1d6224aee84fb) |
| Dispute | 2 of 4 pages, 0.5 refunded | `RefundVault.refund` | [`79d22019…`](https://stellar.expert/explorer/testnet/tx/79d22019715f76cd500b85c1581415cad02878ec44d623fd5d35666a83b014b6) |
| x402 escrow | ALLOW 1, settled; every fee paid by the facilitator | `pact.open` via x402 | [`a33591a1…`](https://stellar.expert/explorer/testnet/tx/a33591a1768b548516f1222d34167a37c17069eb377073f50e07f26cef8071b5) |
| | | `record_verdict` via `/pact/submit` | [`9d63a621…`](https://stellar.expert/explorer/testnet/tx/9d63a621dda5573a36a8eb2e8aab0f2715a14674e9804691799b0ca1b82fe895) |
| | | `settle` via `/pact/submit` | [`51d659e4…`](https://stellar.expert/explorer/testnet/tx/51d659e4ee18c066088ec922202b3380d179909d2f8745f09b25f5878a2cb073) |

## Progress

Every task and its state is tracked in each repository's `ROADMAP.md`, and every pull request updates it: [contracts](https://github.com/Pactwright/Pactwright-contracts/blob/main/ROADMAP.md), [Kit](https://github.com/Pactwright/Pactwright-Kit/blob/main/ROADMAP.md), [Studio](https://github.com/Pactwright/Pactwright-studio/blob/main/ROADMAP.md).

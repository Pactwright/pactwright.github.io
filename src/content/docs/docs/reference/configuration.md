---
title: Configuration
description: Every environment variable, by component.
---

Every Pactwright service refuses to start when its configuration is missing or inconsistent, and lists every problem at once. The Kit's [`.env.example`](https://github.com/Pactwright/Pactwright-Kit/blob/main/.env.example) has all of them with comments.

## Network (all components)

| Variable | Testnet value |
|---|---|
| `STELLAR_NETWORK` | `testnet` |
| `STELLAR_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015` |
| `STELLAR_RPC_URL` | `https://soroban-testnet.stellar.org` |
| `USDC_SAC_ID` | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` |
| `PACT_CONTRACT_ID` | `CDUXJJUNYFILEYHE3LITANJEKCDFERNAABOSG75OWATFVM776BCMFEV6` |
| `RECEIPT_ANCHOR_ID` | `CAEO5GBC3ULRC5RYBSCSOXLNXHU2HZAHNW5HY5LZM3DIPFMX357ILNJ2` |

## By component

| Component | Variables | Details |
|---|---|---|
| Seller | `SELLER_ADDRESS`, `SELLER_DELIVERY_KEY`, `VERIFIER_PUBLIC_KEY`, `VERIFIER_URL`, `FACILITATOR_URL`, `FACILITATOR_API_KEY`, `SELLER_REFUND_VAULT_ID`; for the signing key, `KMS_KEY_ID` (see below) | [Sell behind a pact](/docs/guides/seller/#configure-the-seller) |
| Agent | `AGENT_SECRET_KEY` (testnet only), `SPONSOR_SECRET_KEY`, `FACILITATOR_URL` | [Buy as an agent](/docs/guides/agent/) |
| Verifier | `VERIFIER_SECRET_KEY`, `VERIFIER_PROVIDER`, `VERIFIER_MODEL`, `VERIFIER_EFFORT`, `VERIFIER_LLM_API_KEY`, `LLM_BASE_URL`, `EVIDENCE_BUCKET_URL`, `STELLAR_RPC_URL`, `FACILITATOR_URL`, `VERIFIER_PUBLIC_URL`, `DATABASE_URL` | [Run a verifier](/docs/guides/verifier/#configuration) |
| Studio | `DATABASE_URL`, `STELLAR_NETWORK`, `STELLAR_RPC_URL`, `PACT_CONTRACT_ID`, `RECEIPT_ANCHOR_ID`, `HISTORY_RPC_URL`, `CRON_SECRET`, `ANCHORER_SECRET`; optionally `INDEX_START_LEDGER`, `REFUND_VAULT_IDS`, `NEXT_PUBLIC_STELLAR_NETWORK` | The [Studio README](https://github.com/Pactwright/Pactwright-studio#readme) |

## Secrets

Keep keys out of repositories and logs. On Render, secret values are set as `sync: false` in the blueprint and entered in the dashboard. The seller key that signs refunds and settlements can live in a KMS, so it never exists on the seller's server:

| Variables | Signs with |
|---|---|
| `KMS_KEY_ID=vault:<key>`, `VAULT_ADDR`, `VAULT_TOKEN` | A HashiCorp Vault transit key (ed25519). A testnet refund has been signed this way |
| `KMS_KEY_ID`, `KMS_ENDPOINT` | A remote signing service |
| `SELLER_SECRET_KEY` | A local secret key. For development only |

Every signature a KMS returns is checked against the configured public key before it's used.

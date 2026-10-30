---
title: Run a verifier
description: Configure, build and deploy the verifier service.
---

The verifier is a small HTTP service in [Pactwright-Kit](https://github.com/Pactwright/Pactwright-Kit/tree/main/services/verifier). It turns evidence into a signed verdict. It holds no money; its only power is its signing key, so treat that key with care.

## Configuration

The process refuses to start, listing every problem at once, if anything required is missing. It never invents a model reading.

| Variable | Required | What it is |
|---|---|---|
| `VERIFIER_SECRET_KEY` | Yes | The Stellar secret seed that signs envelopes and attestations. Its public key must be the one the `pact` contract and the sellers name |
| `VERIFIER_PROVIDER` | Yes | The model provider. Recorded in every envelope |
| `VERIFIER_MODEL` | Yes | The pinned model ID. There is no default model |
| `VERIFIER_LLM_API_KEY` | Yes | The provider's API key |
| `LLM_BASE_URL` | No | The provider's OpenAI-compatible base URL, if it isn't the adapter's default. For Google: `https://generativelanguage.googleapis.com/v1beta/openai` |
| `VERIFIER_EFFORT` | No | Reasoning effort, where the provider supports it. Recorded in every envelope |
| `VERIFIER_MODEL_TIMEOUT_MS` | No | Per-request model timeout (default 60 seconds). Rate limits and overloads are retried |
| `EVIDENCE_BUCKET_URL` | Yes | An `https` prefix the verifier can read evidence from. Evidence outside it is refused before any fetch |
| `STELLAR_RPC_URL` | Yes | A Soroban RPC. Each escrow attestation is stamped with its latest ledger, which the contract requires |
| `FACILITATOR_URL` | Yes | The x402 facilitator, for submitting verdicts |
| `VERIFIER_PUBLIC_URL` | Yes, unless on Render | Where this verifier is reachable; envelope links point at `<url>/v1/envelopes/<sha256>`. On Render, `RENDER_EXTERNAL_URL` is used when this is unset |
| `DATABASE_URL` (or `VERIFIER_DATABASE_URL`) | In production | Postgres for verdict envelopes, so they survive restarts. With `NODE_ENV=production` (as in the Docker image) the verifier refuses to start without it |
| `PORT` / `VERIFIER_PORT` | No | Listening port; `VERIFIER_PORT` wins, then the host's `PORT`, then 8787 |

## Build and run

```bash
docker build -f services/verifier/Dockerfile -t pactwright-verifier .

docker run -p 10000:10000 \
  -e VERIFIER_SECRET_KEY=S… \
  -e VERIFIER_PROVIDER=google -e VERIFIER_MODEL=gemini-3.5-flash-lite \
  -e LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai \
  -e VERIFIER_LLM_API_KEY=… \
  -e EVIDENCE_BUCKET_URL=https://raw.githubusercontent.com/Pactwright/pactwright-evidence/main/ \
  -e STELLAR_RPC_URL=https://soroban-testnet.stellar.org \
  -e FACILITATOR_URL=https://pactwright-facilitator-testnet.onrender.com \
  -e VERIFIER_PUBLIC_URL=http://localhost:10000 \
  -e DATABASE_URL=postgres://… \
  pactwright-verifier

curl http://localhost:10000/health
```

`/health` returns the verifier's public key, both as a Stellar address and as the hex that sellers put in their terms. Check it matches before pointing anyone at your verifier.

## Deploy on Render

The Kit's [`render.yaml`](https://github.com/Pactwright/Pactwright-Kit/blob/main/render.yaml) describes the hosted testnet verifier and facilitator. In Render, choose **New → Blueprint**, select the repository, and fill in the secret values when asked. They stay in Render's secret store.

## Evidence

Evidence files are addressed by their content: the request lists each file's URI and SHA-256, the verifier fetches it from under `EVIDENCE_BUCKET_URL` and refuses it if the hash doesn't match. On testnet, the public [`Pactwright/pactwright-evidence`](https://github.com/Pactwright/pactwright-evidence) repository serves as the store, laid out as `<pact_id>/<sha256>`. It's public, so it's for testnet only.

## Measuring accuracy

`services/verifier/eval` runs the labelled cases through the full pipeline with your configured model and reports accuracy per condition kind. The `verifier-eval` workflow fails if it drops below 90%.

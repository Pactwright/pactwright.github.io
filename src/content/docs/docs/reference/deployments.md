---
title: Testnet deployments
description: Contract addresses, hosted services and identities on Stellar testnet, and how to check them.
---

There is no mainnet deployment. Mainnet follows an audit. The source of truth for these values is [`DEPLOYMENTS.md`](https://github.com/Pactwright/Pactwright-contracts/blob/main/DEPLOYMENTS.md).

## Contracts

| Contract | ID | WASM sha256 |
|---|---|---|
| `pact` | [`CDUXJJUNYFILEYHE3LITANJEKCDFERNAABOSG75OWATFVM776BCMFEV6`](https://stellar.expert/explorer/testnet/contract/CDUXJJUNYFILEYHE3LITANJEKCDFERNAABOSG75OWATFVM776BCMFEV6) | `748b5dbcc800d8cd3bdaf4b24555bfa8e3659cdefb60888791fb9a086b35d1a4` |
| `ReceiptAnchor` (Accensa v0.2.0) | [`CAEO5GBC3ULRC5RYBSCSOXLNXHU2HZAHNW5HY5LZM3DIPFMX357ILNJ2`](https://stellar.expert/explorer/testnet/contract/CAEO5GBC3ULRC5RYBSCSOXLNXHU2HZAHNW5HY5LZM3DIPFMX357ILNJ2) | `d7ec929b1f678d1f26f98dd803a566a44502ce7ddb890613612007166061f31e` |
| USDC (Circle testnet, Stellar Asset Contract) | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` | |

The `pact` contract was constructed with:

| Argument | Value |
|---|---|
| `admin` | `GD4BTAHYO7JBRTUVIB7DY7OLOTZZSDAE26YLRWPJ7OVQ3KLINK237UOT` |
| `token` | The USDC contract above |
| `verifier` | `4efdaeb6c34ef1babbc844909afe576b288a36a2afe43a8bf6fcff82c9ffe4ff` |
| `max_pact_ledgers` | `120960` (about 7 days) |

## Hosted services

| Service | URL |
|---|---|
| Verifier | `https://pactwright-verifier-testnet.onrender.com` |
| x402 facilitator (Accensa, with the `pact` scheme) | `https://pactwright-facilitator-testnet.onrender.com`. Requires an API key |
| Studio | [`https://pactwright-studio-testnet.onrender.com`](https://pactwright-studio-testnet.onrender.com) |
| Evidence store | [`Pactwright/pactwright-evidence`](https://github.com/Pactwright/pactwright-evidence), served from `raw.githubusercontent.com` |

They run on a free tier and sleep when idle, so the first request can take up to a minute.

## Identities

| Identity | Address | Role |
|---|---|---|
| `pactwright-deployer` | `GD4BTAHYO7JBRTUVIB7DY7OLOTZZSDAE26YLRWPJ7OVQ3KLINK237UOT` | Deploys contracts; `pact` admin |
| `pactwright-sponsor` | `GAVTUPPEMLXAE2TFFPMPG43QTEV5UPKPFV55YQ4OUYVTE4NML7W6F2LU` | Sponsors agent account reserves; the facilitator's fee payer |
| `pactwright-verifier` | `GBHP3LVWYNHPDOV3ZBCJBGX6K5VSRCRWUKX6IOUL636P7AWJ77SP7TDT` | Signs verdict attestations |
| `pactwright-anchorer` | `GAKQTGNQFHVZDTPFW75J322QZYPSX7ULTFGEUFGDR5E4NFIHSSUVM4KZ` | `ReceiptAnchor` admin; anchors receipt batches |

:::caution[Retired, do not use]
Two earlier `ReceiptAnchor` deployments, `CA2VU3DR…3ITX` and `CCSST64R…3K7`, were retired on 28 October 2026 after an anchorer key was exposed. The current anchor is the one above.
:::

## Check the deployed bytes

The contract build is reproducible: the bytes you build, the release asset and the deployed contract are the same.

```bash
cd Pactwright-contracts
scripts/build.sh            # prints the WASM sha256: 748b5dbc…5d1a4
gh release download v0.1.0-rc.1 -R Pactwright/Pactwright-contracts -p '*.sha256' -O -

# The deployed configuration (read-only simulation, no fees)
stellar contract invoke --network testnet --source <any-funded-identity> --send=no \
  --id CDUXJJUNYFILEYHE3LITANJEKCDFERNAABOSG75OWATFVM776BCMFEV6 -- get_config
```

Testnet is reset from time to time. After a reset, the contracts are redeployed and this page is updated.

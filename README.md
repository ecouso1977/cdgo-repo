# Codigio Token

This folder contains the ERC-20 token for **CDGO** — the crowdfunding token for [CODIGIO IDE](https://codigioide.com) on Ethereum. The token website is [https://getcdgo.com](https://getcdgo.com).

The implementation is intentionally limited to a standards-based token, local tests, and testnet deployment tooling. It does not make the token lawful for fundraising, public sale, or exchange listing in the United States.

## What is included

- ERC-20 token contract with permit and voting extensions
- Contributor vesting wallet contract
- Treasury timelock vault contract
- Hardhat build and test setup
- Testnet deployment script
- Explorer verification script
- Token metadata template
- Listing-readiness and compliance documentation

## Token profile

- Name: Codigio
- Symbol: CDGO
- Decimals: 18
- Initial supply: 1,000,000,000 CDGO
- Minting model: fixed supply minted at deployment to the configured owner
- Optional launch allocation flow: 20% treasury timelock vault and 20% contributor vesting wallet

## Quick start

```bash
npm install
cp .env.example .env
npm test
npm run build
```

To deploy to Sepolia:

```bash
npm run deploy:sepolia
```

If `USE_TREASURY_VAULT=true`, the deploy script creates a `CodigioTreasuryVault` timelock and transfers 20% of supply there.
If `USE_TREASURY_VAULT=false` and `TREASURY_WALLET` is set, the deploy script transfers 20% of supply there.
If `CONTRIBUTOR_WALLET` is set, the deploy script creates a vesting wallet and locks 20% of supply for the configured vesting duration.

To verify a deployed contract after setting `TOKEN_ADDRESS` and `TOKEN_OWNER` in `.env`:

```bash
npm run verify:sepolia
```

To run an automated readiness check for missing env vars and unresolved metadata fields:

```bash
npm run readiness
```

See `docs/testnet-launch-checklist.md` for the full testnet release flow and `docs/token-metadata.json` for the metadata template you can submit to explorers and wallets.

Use `docs/listing-submission-template.md` to assemble the packet required by exchanges, token aggregators, and analytics marketplaces.

Use `docs/mainnet-launch-package.md` as the gated release package for any eventual mainnet launch.

## Important legal note

Because the intended use you described is fundraising in exchange for participation in the CODIGIO IDE project, a US launch can trigger securities-law, money-transmission, consumer-protection, sanctions, tax, and exchange-listing obligations. The docs in `docs/` are there to force that review before any mainnet sale or marketplace submission.
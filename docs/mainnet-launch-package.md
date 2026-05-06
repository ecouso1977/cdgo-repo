# Codigio Mainnet Launch Package

This package is intentionally gated. It organizes the files and decisions required for a mainnet launch, but it does not authorize deployment, sale, or exchange outreach until legal classification is complete.

## Included technical assets

- ERC-20 token contract with voting and permit support
- contributor vesting contract
- treasury timelock vault contract
- deployment and verification scripts for mainnet and testnet
- allocation plan and submission templates

## Required files before mainnet deployment

- completed `.env` with `MAINNET_RPC_URL`, deployer key, owner, treasury, and contributor addresses
- verified logo, website `https://getcdgo.com`, social links, GitHub repo `https://github.com/ecouso1977/cdgo-repo.git`, and support contact `support@getcdgo.com`
- finalized tokenomics memo
- audit report
- legal opinion covering the intended launch structure

## Mainnet command sequence after signoff

1. Run `npm run build`.
2. Run `npm test`.
3. Fund the deployer account with mainnet ETH.
4. Deploy with `npm run deploy:mainnet`.
5. Set `TOKEN_ADDRESS` and verify with `npm run verify:mainnet`.
6. Publish metadata and submit the listing packet.

## Current blockers

- no legal classification memo for the US fundraising model
- no audit report
- no final social details
- no mainnet deployment address or verification URL

## Release gate

Do not deploy to mainnet or submit to exchanges until legal counsel signs off on the token classification and distribution model.
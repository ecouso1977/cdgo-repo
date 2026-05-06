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
- no published post-launch incident response policy
- no finalized exchange legal packet for all target jurisdictions

## Mainnet deployment record (executed)

- token address: `0xCAFacE86f71cD3926836F7AAd854b27167dfCbc7`
- token verification: `https://etherscan.io/address/0xCAFacE86f71cD3926836F7AAd854b27167dfCbc7#code`
- treasury vault address: `0x4dbCEEE3C6c333f55c3F195fb4571239e4e75d15`
- treasury verification: `https://etherscan.io/address/0x4dbCEEE3C6c333f55c3F195fb4571239e4e75d15#code`
- contributor vesting address: `0x51d7cb8F1AC2B547C1CD83af23335cF2750Ca4D3`
- contributor verification: `https://etherscan.io/address/0x51d7cb8F1AC2B547C1CD83af23335cF2750Ca4D3#code`
- uniswap v2 pair: `0xB2dc5c64776732feAf58098b05F39cC73574441a`
- geckoterminal: `https://www.geckoterminal.com/eth/pools/0xB2dc5c64776732feAf58098b05F39cC73574441a`

## Release gate

Do not deploy to mainnet or submit to exchanges until legal counsel signs off on the token classification and distribution model.
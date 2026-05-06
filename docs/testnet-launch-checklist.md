# Testnet Launch Checklist

Use this checklist to run a proper Codigio testnet release before any mainnet decision.

## Prepare the deployer

1. Fund the deployer wallet with Sepolia ETH or Base Sepolia ETH.
2. Copy `.env.example` to `.env`.
3. Set `RPC_URL`, `PRIVATE_KEY`, and `TOKEN_OWNER`.
4. Add `ETHERSCAN_API_KEY` or `BASESCAN_API_KEY` for verification.

## Validate locally

1. Run `npm install`.
2. Run `npm run build`.
3. Run `npm test`.

## Deploy

1. Deploy to Sepolia with `npm run deploy:sepolia`.
2. Or deploy to Base Sepolia with `npm run deploy:base-sepolia`.
3. Save the deployed contract address and transaction hash.

## Verify

1. Set `TOKEN_ADDRESS` in `.env` to the deployed address.
2. Run `npm run verify:sepolia` or `npm run verify:base-sepolia`.
3. Confirm the verified source on the relevant explorer.

## Publish metadata

1. Fill out `docs/token-metadata.json` with the final logo URL and site links.
2. Host the logo and metadata on a stable public endpoint.
3. Submit the token profile to wallets, explorers, and analytics sites.

## Record artifacts

Keep these values in your launch record:

- network
- contract address
- deployment transaction hash
- verification URL
- owner wallet
- total supply
- metadata URL

Do not treat testnet distribution as a substitute for legal review on a US fundraising launch.
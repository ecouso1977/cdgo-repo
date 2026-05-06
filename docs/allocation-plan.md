# Codigio Allocation Plan

This file turns the tokenomics draft into a deployable allocation model.

## Enforced by the current scaffold

- 20% treasury reserve can be locked in a `CodigioTreasuryVault` timelock during deployment
- 20% contributor allocation can be locked in a vesting wallet during deployment

## Still off-chain unless you add more contracts

- ecosystem incentives
- community growth and partnerships
- liquidity provisioning schedule

## Recommended wallet roles

- `TOKEN_OWNER`: governance or deployment controller wallet
- `TREASURY_ADMIN`: timelock admin for treasury setup
- `TREASURY_PROPOSERS`: addresses allowed to schedule treasury operations
- `TREASURY_EXECUTORS`: addresses allowed to execute treasury operations after delay
- `CONTRIBUTOR_WALLET`: beneficiary of the contributor vesting wallet

## Recommended next hardening step

Move `TREASURY_PROPOSERS` and `TREASURY_EXECUTORS` to a real multisig or governance process and split the remaining allocations into dedicated distribution contracts before any mainnet launch.
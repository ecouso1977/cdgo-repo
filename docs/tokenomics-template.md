# Codigio Tokenomics Template

Use this as the minimum internal design document before deployment.

## Intended purpose

Define exactly what token holders receive:

- governance rights
- access rights
- contribution rewards
- fee discounts
- treasury participation

## Supply design

- fixed supply: 1,000,000,000 CODIGIO
- decimals: 18
- inflation: none in the current contract

## Proposed allocation draft

- 35% ecosystem incentives
- 20% treasury reserve
- 20% core contributors
- 15% community growth and partnerships
- 10% liquidity provisioning

## Vesting questions to answer

- Which wallets are locked?
- What are the cliffs and vesting durations?
- Can insiders transfer before product milestones?
- Who can authorize treasury movements?

## Current scaffold support

- treasury reserve can be sent at deployment to `TREASURY_WALLET`
- contributor allocation can be locked in a `CodigioContributorVesting` wallet
- vesting start and duration can be configured through environment variables

## Governance questions to answer

- Is voting active at launch?
- Is delegation expected?
- Is there a multisig controlling treasury funds?
- What on-chain actions are governed by token vote?
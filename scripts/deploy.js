const hre = require("hardhat");
require("dotenv").config();

function parseTimestamp(value, fallbackValue) {
  if (!value) {
    return fallbackValue;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid timestamp value: ${value}`);
  }

  return Math.floor(parsed);
}

function parseAddressList(value, fallbackValue) {
  if (!value) {
    return fallbackValue;
  }

  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) {
    return fallbackValue;
  }

  for (const item of items) {
    if (!hre.ethers.isAddress(item)) {
      throw new Error(`Invalid address in list: ${item}`);
    }
  }

  return items;
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const tokenOwner = process.env.TOKEN_OWNER || deployer.address;
  const treasuryWallet = process.env.TREASURY_WALLET;
  const treasuryAdmin = process.env.TREASURY_ADMIN || tokenOwner;
  const treasuryMinDelay = parseTimestamp(process.env.TREASURY_MIN_DELAY, 2 * 24 * 60 * 60);
  const treasuryProposers = parseAddressList(process.env.TREASURY_PROPOSERS, [tokenOwner]);
  const treasuryExecutors = parseAddressList(process.env.TREASURY_EXECUTORS, [tokenOwner]);
  const useTreasuryVault = process.env.USE_TREASURY_VAULT !== "false";
  const contributorWallet = process.env.CONTRIBUTOR_WALLET;
  const contributorVestingStart = parseTimestamp(
    process.env.CONTRIBUTOR_VESTING_START,
    Math.floor(Date.now() / 1000)
  );
  const contributorVestingDuration = parseTimestamp(
    process.env.CONTRIBUTOR_VESTING_DURATION,
    365 * 24 * 60 * 60
  );

  console.log(`Deploying CodigioToken from ${deployer.address}`);
  console.log(`Initial owner: ${tokenOwner}`);

  const codigioToken = await hre.ethers.deployContract("CodigioToken", [tokenOwner]);
  await codigioToken.waitForDeployment();

  const tokenAddress = await codigioToken.getAddress();

  console.log(`CodigioToken deployed to ${tokenAddress}`);

  const totalSupply = await codigioToken.totalSupply();
  const treasuryAllocation = (totalSupply * 20n) / 100n;
  const contributorAllocation = (totalSupply * 20n) / 100n;

  if (useTreasuryVault) {
    const treasuryVault = await hre.ethers.deployContract("CodigioTreasuryVault", [
      treasuryMinDelay,
      treasuryProposers,
      treasuryExecutors,
      treasuryAdmin
    ]);
    await treasuryVault.waitForDeployment();

    const treasuryVaultAddress = await treasuryVault.getAddress();
    const treasuryTransfer = await codigioToken.transfer(treasuryVaultAddress, treasuryAllocation);
    await treasuryTransfer.wait();

    console.log(`Treasury vault deployed to ${treasuryVaultAddress}`);
    console.log(
      `Treasury allocation locked in timelock vault: ${hre.ethers.formatUnits(treasuryAllocation, 18)} CDGO`
    );
  } else if (treasuryWallet) {
    const treasuryTransfer = await codigioToken.transfer(treasuryWallet, treasuryAllocation);
    await treasuryTransfer.wait();
    console.log(`Treasury allocation sent to ${treasuryWallet}: ${hre.ethers.formatUnits(treasuryAllocation, 18)} CDGO`);
  }

  if (contributorWallet) {
    const contributorVesting = await hre.ethers.deployContract("CodigioContributorVesting", [
      contributorWallet,
      contributorVestingStart,
      contributorVestingDuration
    ]);
    await contributorVesting.waitForDeployment();

    const vestingAddress = await contributorVesting.getAddress();
    const vestingTransfer = await codigioToken.transfer(vestingAddress, contributorAllocation);
    await vestingTransfer.wait();

    console.log(`Contributor vesting wallet deployed to ${vestingAddress}`);
    console.log(
      `Contributor allocation locked for ${contributorWallet}: ${hre.ethers.formatUnits(contributorAllocation, 18)} CDGO`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
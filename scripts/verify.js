const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const tokenOwner = process.env.TOKEN_OWNER;

  if (!tokenAddress) {
    throw new Error("TOKEN_ADDRESS is required to verify the contract");
  }

  if (!tokenOwner) {
    throw new Error("TOKEN_OWNER is required because the constructor argument must match deployment");
  }

  console.log(`Verifying CodigioToken at ${tokenAddress}`);

  await hre.run("verify:verify", {
    address: tokenAddress,
    constructorArguments: [tokenOwner]
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
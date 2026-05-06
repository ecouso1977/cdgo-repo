const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CodigioTreasuryVault", function () {
  it("holds treasury funds behind a timelock before release", async function () {
    const [owner, recipient] = await ethers.getSigners();
    const codigioToken = await ethers.deployContract("CodigioToken", [owner.address]);
    await codigioToken.waitForDeployment();

    const delay = 2 * 24 * 60 * 60;
    const treasuryVault = await ethers.deployContract("CodigioTreasuryVault", [
      delay,
      [owner.address],
      [owner.address],
      owner.address
    ]);
    await treasuryVault.waitForDeployment();

    const totalSupply = await codigioToken.totalSupply();
    const treasuryAllocation = totalSupply * 20n / 100n;
    await codigioToken.transfer(await treasuryVault.getAddress(), treasuryAllocation);

    const amountToRelease = ethers.parseUnits("1000", 18);
    const encodedTransfer = codigioToken.interface.encodeFunctionData("transfer", [recipient.address, amountToRelease]);
    const predecessor = ethers.ZeroHash;
    const salt = ethers.id("codigio-treasury-release");

    await treasuryVault.schedule(
      await codigioToken.getAddress(),
      0,
      encodedTransfer,
      predecessor,
      salt,
      delay
    );

    await expect(
      treasuryVault.execute(
        await codigioToken.getAddress(),
        0,
        encodedTransfer,
        predecessor,
        salt
      )
    ).to.be.reverted;

    await time.increase(delay + 1);

    await treasuryVault.execute(
      await codigioToken.getAddress(),
      0,
      encodedTransfer,
      predecessor,
      salt
    );

    expect(await codigioToken.balanceOf(recipient.address)).to.equal(amountToRelease);
    expect(await codigioToken.balanceOf(await treasuryVault.getAddress())).to.equal(treasuryAllocation - amountToRelease);
  });
});
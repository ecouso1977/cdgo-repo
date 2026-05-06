const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CodigioToken", function () {
  async function deployTokenFixture() {
    const [owner, participant] = await ethers.getSigners();
    const codigioToken = await ethers.deployContract("CodigioToken", [owner.address]);
    await codigioToken.waitForDeployment();

    return { codigioToken, owner, participant };
  }

  it("mints the entire supply to the initial owner", async function () {
    const { codigioToken, owner } = await deployTokenFixture();
    const totalSupply = await codigioToken.totalSupply();

    expect(await codigioToken.balanceOf(owner.address)).to.equal(totalSupply);
  });

  it("tracks the configured owner", async function () {
    const { codigioToken, owner } = await deployTokenFixture();

    expect(await codigioToken.owner()).to.equal(owner.address);
  });

  it("supports transfers between ecosystem participants", async function () {
    const { codigioToken, owner, participant } = await deployTokenFixture();
    const amount = ethers.parseUnits("2500", 18);

    await expect(codigioToken.transfer(participant.address, amount))
      .to.emit(codigioToken, "Transfer")
      .withArgs(owner.address, participant.address, amount);

    expect(await codigioToken.balanceOf(participant.address)).to.equal(amount);
  });

  it("can lock a contributor allocation in a vesting wallet", async function () {
    const { codigioToken, owner, participant } = await deployTokenFixture();
    const latestTimestamp = await time.latest();
    const duration = 365 * 24 * 60 * 60;
    const contributorAllocation = (await codigioToken.totalSupply()) * 20n / 100n;

    const contributorVesting = await ethers.deployContract("CodigioContributorVesting", [
      participant.address,
      latestTimestamp,
      duration
    ]);
    await contributorVesting.waitForDeployment();

    await codigioToken.transfer(await contributorVesting.getAddress(), contributorAllocation);

    await time.increase(duration / 2);

    const releasableHalfway = await contributorVesting["releasable(address)"](
      await codigioToken.getAddress()
    );
    const lowerBound = contributorAllocation * 49n / 100n;
    const upperBound = contributorAllocation * 51n / 100n;

    expect(releasableHalfway).to.be.gte(lowerBound);
    expect(releasableHalfway).to.be.lte(upperBound);

    await contributorVesting["release(address)"](await codigioToken.getAddress());

    const participantBalance = await codigioToken.balanceOf(participant.address);

    expect(participantBalance).to.be.gte(lowerBound);
    expect(participantBalance).to.be.lte(upperBound);
    expect(await codigioToken.balanceOf(owner.address)).to.equal(
      (await codigioToken.totalSupply()) - contributorAllocation
    );
  });
});
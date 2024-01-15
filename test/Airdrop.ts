import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ClaimAirDrop", function () {
  async function deployToken() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, otherAccount2] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("SnapitToken");
    const erc20 = await ERC20.deploy();
    const tokenAddress = await erc20.getAddress();
    const AirDrop = await ethers.getContractFactory("ClaimBasedAirdrop");
    const airDrop = await AirDrop.deploy(tokenAddress);

    const readAirdropToken = await airDrop.token();
    expect(readAirdropToken).to.be.equal(tokenAddress);

    return { erc20, airDrop, owner, otherAccount, otherAccount2 };
  }

  describe("setAirDrops", function () {
    it("Should fail without allowance", async function () {
      const { erc20, airDrop, owner, otherAccount } = await loadFixture(
        deployToken
      );

      const readOwnerBalance = await erc20.balanceOf(owner);
      expect(readOwnerBalance).to.be.equal(1_000_000_000);

      await expect(
        airDrop.setAirdrops([otherAccount], [100])
      ).to.be.revertedWithCustomError(airDrop, "AmountMismatch");
    });

    it("Should fail without sufficient balance", async function () {
      const { otherAccount, airDrop } = await loadFixture(deployToken);
      await expect(
        airDrop.connect(otherAccount).setAirdrops([otherAccount], [100])
      ).to.be.revertedWithCustomError(airDrop, "InsufficientBalance");
    });

    it("Should setAirdrops after giving allowence", async function () {
      const { owner, otherAccount, airDrop, erc20 } = await loadFixture(
        deployToken
      );

      // Give required allowence to setAirdrop
      await erc20.approve(airDrop, "1000");

      // SetAirdrop for otherAccount
      await expect(airDrop.setAirdrops([otherAccount], [1000])).not.to.be
        .reverted;

      await expect(airDrop.connect(otherAccount).claim()).not.to.be.reverted;

      expect(await erc20.balanceOf(otherAccount)).to.be.equal(1000);
    });

    it("Should setAirdrops after giving allowence", async function () {
      const { owner, otherAccount, airDrop, erc20, otherAccount2 } =
        await loadFixture(deployToken);

      expect(await erc20.balanceOf(otherAccount)).to.be.equal(0);

      // Give required allowence to setAirdrop
      await erc20.connect(owner).approve(airDrop, "1000");

      // SetAirdrop for otherAccount
      await expect(
        airDrop.setAirdrops([otherAccount], [10000])
      ).to.be.revertedWithCustomError(airDrop, "AmountMismatch");
      await expect(airDrop.setAirdrops([otherAccount], [500])).not.to.be
        .reverted;
      await expect(airDrop.setAirdrops([otherAccount], [400])).not.to.be
        .reverted;
      await expect(airDrop.connect(otherAccount).claim()).not.to.be.reverted;
      expect(await erc20.balanceOf(otherAccount)).to.be.equal(900);
    });
  });
});

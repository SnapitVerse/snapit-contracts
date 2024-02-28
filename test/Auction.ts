import {
  loadFixture,
  mine,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers, network } from 'hardhat'

describe('Auction', function () {
  async function deployAuction() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, otherAccount2] = await ethers.getSigners()

    const SnapitToken = await ethers.getContractFactory('SnapitToken')
    const snapitToken = await SnapitToken.deploy()
    const snapitTokenAddress = await snapitToken.getAddress()

    const SnapitNFT = await ethers.getContractFactory('SnapitNFT')
    const snapitNft = await SnapitNFT.deploy()
    const snapitNftAddress = await snapitNft.getAddress()

    snapitNft.mintUniqueToken(owner.address, 1, '0x')

    snapitToken.connect(owner).transfer(otherAccount, 500000)
    snapitToken.connect(owner).transfer(otherAccount2, 500000)

    const Auction = await ethers.getContractFactory('SnapitAuction')
    const auction = await Auction.deploy(snapitTokenAddress, snapitNftAddress)
    const auctionAddress = await auction.getAddress()

    snapitNft.setApprovalForAll(auctionAddress, true)

    const ownerInitialBalance = await snapitToken.balanceOf(owner.address)
    const otherAccountInitialBalance = await snapitToken.balanceOf(
      otherAccount.address
    )
    const otherAccount2InitialBalance = await snapitToken.balanceOf(
      otherAccount2.address
    )
    return {
      snapitToken,
      snapitNft,
      snapitNftAddress,
      auction,
      auctionAddress,
      owner,
      ownerInitialBalance,
      otherAccount,
      otherAccountInitialBalance,
      otherAccount2,
      otherAccount2InitialBalance,
    }
  }

  describe('createAuction and bid', async function () {
    let snapitToken: any,
      snapitNft: any,
      snapitNftAddress: string,
      auction: any,
      auctionAddress: string,
      owner: any,
      ownerInitialBalance: bigint,
      otherAccount: any,
      otherAccountInitialBalance: bigint,
      otherAccount2: any,
      otherAccount2InitialBalance: bigint

    this.beforeAll(async () => {
      ; ({
        snapitToken,
        snapitNft,
        snapitNftAddress,
        auction,
        auctionAddress,
        owner,
        ownerInitialBalance,
        otherAccount,
        otherAccountInitialBalance,
        otherAccount2,
        otherAccount2InitialBalance,
      } = await loadFixture(deployAuction))
    })

    const startTime = Math.floor(Date.now() / 1000)

    const expirationDelta = 3600

    const createAuctionParams1 = {
      tokenId: 1,
      newStartingPrice: 100000,
      newMinPriceDifference: 10000,
      newBuyoutPrice: 10000000,
      newStartTime: startTime,
      newEndTime: startTime + expirationDelta,
    }

    it('Should create auction', async function () {
      const response = await (auction as any)
        .connect(owner)
        .createAuction(
          createAuctionParams1.tokenId,
          createAuctionParams1.newStartingPrice,
          createAuctionParams1.newMinPriceDifference,
          createAuctionParams1.newBuyoutPrice,
          createAuctionParams1.newStartTime,
          createAuctionParams1.newEndTime
        )
    })

    it("Should fail to create auction by non-owner", async function () {
      const { snapitNft, auction, owner, otherAccount } = await deployAuction();

      const tokenId = 1;
      const startingPrice = ethers.parseUnits("1", "ether");
      const minPriceDifference = ethers.parseUnits("0.1", "ether");
      const buyoutPrice = ethers.parseUnits("10", "ether");
      const startTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const endTime = startTime + 3600; // 1 hour after start time

      // Attempt to create an auction with an account that does not own the NFT
      await expect(
        auction.connect(otherAccount).createAuction(
          tokenId,
          startingPrice,
          minPriceDifference,
          buyoutPrice,
          startTime,
          endTime
        )
      ).to.be.revertedWithCustomError(auction, "SenderMustOwnNFT")
    })

    it('Should allow bidding in an auction and handle refunds correctly', async function () {
      const initialBidPrice = 200000
      const secondBidPrice = 300000

      // Assuming snapitToken is the currency used for bidding
      // Owner approves the auction contract to transfer snapitToken on their behalf
      await snapitToken
        .connect(otherAccount)
        .approve(auctionAddress, initialBidPrice)

      await snapitToken
        .connect(otherAccount2)
        .approve(auctionAddress, secondBidPrice)

      // First bid by otherAccount
      await auction
        .connect(otherAccount)
        .bid(createAuctionParams1.tokenId, initialBidPrice)

      // Retrieve and verify the auction details after the first bid
      let updatedAuction = await auction.auctions(createAuctionParams1.tokenId)
      expect(updatedAuction.bidOwner).to.equal(otherAccount.address)
      expect(updatedAuction.bidPrice).to.equal(initialBidPrice)

      let otherAccountBalance = await snapitToken.balanceOf(otherAccount)

      expect(BigInt(otherAccountBalance)).to.be.equal(
        BigInt(otherAccountInitialBalance) - BigInt(initialBidPrice)
      )

      // Second bid by otherAccount2, should be higher than the first
      await auction
        .connect(otherAccount2)
        .bid(createAuctionParams1.tokenId, secondBidPrice)

      // Retrieve and verify the auction details after the second bid
      updatedAuction = await auction.auctions(createAuctionParams1.tokenId)
      expect(updatedAuction.bidOwner).to.equal(otherAccount2.address)
      expect(updatedAuction.bidPrice).to.equal(secondBidPrice)

      const otherAccount2Balance = await snapitToken.balanceOf(otherAccount2)

      expect(BigInt(otherAccount2Balance)).to.be.equal(
        BigInt(otherAccount2InitialBalance) - BigInt(secondBidPrice)
      )

      otherAccountBalance = await snapitToken.balanceOf(otherAccount)

      expect(BigInt(otherAccountBalance)).to.be.equal(
        BigInt(otherAccountInitialBalance)
      )

      // Additional checks might include verifying the token balances of otherAccount and otherAccount2
      // to ensure that funds were transferred correctly and refunds were processed if necessary.
    })

    it('Should revert claim before endTime', async function () {
      const response1 = await expect(
        auction.claim(createAuctionParams1.tokenId)
      ).to.be.revertedWithCustomError(auction, 'AuctionHasNotFinished')
    })

    it('Should allow claim after endTime is passed by blockTime', async function () {
      await network.provider.request({
        method: 'evm_increaseTime',
        params: [expirationDelta],
      })
      const response = await auction.claim(createAuctionParams1.tokenId)
    })

    it('Should revert claim if token has already been claimed', async function () {
      const response1 = await expect(
        auction.claim(createAuctionParams1.tokenId)
      ).to.be.revertedWithCustomError(auction, 'TokenAlreadyClaimed')
    })

    it('Should transfer claimed NFT and bidded tokens to respective owners', async function () {
      const otherAccount2Balance = await snapitNft.balanceOf(
        otherAccount2.address,
        createAuctionParams1.tokenId
      )
      expect(otherAccount2Balance).to.be.equal(1)

      const ownerBalance = await snapitToken.balanceOf(owner.address)

      const readAuction = await auction.auctions(createAuctionParams1.tokenId)

      const bidPrice: bigint = readAuction.bidPrice

      const ownerNewBalance = ownerInitialBalance + bidPrice

      expect(BigInt(ownerBalance)).to.be.equal(BigInt(ownerNewBalance))
    })

    it("Should fail to create auction with invalid buyout price", async function () {
      const { snapitNft, auction, owner } = await deployAuction();

      const tokenId = 1;
      const startingPrice = ethers.parseUnits("1", "ether");
      const minPriceDifference = ethers.parseUnits("0.1", "ether");
      // Set buyout price lower than starting price + minPriceDifference
      const invalidBuyoutPrice = ethers.parseUnits("1.05", "ether");
      const startTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const endTime = startTime + 3600; // 1 hour after start time

      // Attempt to create an auction with a buyout price lower than the sum of starting price and minimum price difference
      await expect(
        auction.connect(owner).createAuction(
          tokenId,
          startingPrice,
          minPriceDifference,
          invalidBuyoutPrice,
          startTime,
          endTime
        )
      ).to.be.revertedWithCustomError(auction, "StartPricePlusPriceDifferenceCanNotBeMoreThanBuyoutPrice");
    });

    it("Should fail to create auction with start time not before end time", async function () {
      const { snapitNft, auction, owner } = await deployAuction();

      const tokenId = 1;
      const startingPrice = ethers.parseUnits("1", "ether");
      const minPriceDifference = ethers.parseUnits("0.1", "ether");
      const buyoutPrice = ethers.parseUnits("10", "ether");
      // Set start time and end time to be the same, violating the start-before-end requirement
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const endTime = startTime; // End time is the same as start time

      // Attempt to create an auction with invalid timing
      await expect(
        auction.connect(owner).createAuction(
          tokenId,
          startingPrice,
          minPriceDifference,
          buyoutPrice,
          startTime,
          endTime
        )
      ).to.be.revertedWithCustomError(auction, "StartTimeMustBeBeforeEndTime");
    });
  })
})

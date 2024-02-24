import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

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

    snapitToken.connect(owner).transfer(otherAccount, 500000);
    snapitToken.connect(owner).transfer(otherAccount2, 500000);

    const Auction = await ethers.getContractFactory('SnapitAuction')
    const auction = await Auction.deploy(snapitTokenAddress, snapitNftAddress)
    const auctionAddress = await auction.getAddress()

    snapitNft.setApprovalForAll(auctionAddress, true)

    return {
      snapitToken,
      snapitNft,
      snapitNftAddress,
      auction,
      auctionAddress,
      owner,
      otherAccount,
      otherAccount2,
    }
  }

  describe('createAuction and bid', function () {
    it('Should create auction', async function () {
      const {
        snapitToken,
        snapitNft,
        auction,
        owner,
        otherAccount,
        otherAccount2,
      } = await loadFixture(deployAuction)

      const startTime = Math.floor(Date.now() / 1000)

      const createAuctionParams = {
        tokenId: 1,
        newStartingPrice: 100000,
        newMinPriceDifference: 10000,
        newBuyoutPrice: 10000000,
        newStartTime: startTime,
        newEndTime: startTime + 3600,
      }

      const response = await (auction as any).createAuction(
        createAuctionParams.tokenId,
        createAuctionParams.newStartingPrice,
        createAuctionParams.newMinPriceDifference,
        createAuctionParams.newBuyoutPrice,
        createAuctionParams.newStartTime,
        createAuctionParams.newEndTime
      )
    })

    it('Should allow bidding in an auction and handle refunds correctly', async function () {
      const {
        snapitToken,
        snapitNft,
        snapitNftAddress,
        auction,
        auctionAddress,
        owner,
        otherAccount,
        otherAccount2,
      } = await loadFixture(deployAuction);
    
      const startTime = Math.floor(Date.now() / 1000);
      const tokenId = 1;
      const initialBidPrice = 200000;
      const secondBidPrice = 300000;
    
      // Assuming snapitToken is the currency used for bidding
      // Owner approves the auction contract to transfer snapitToken on their behalf
      await snapitToken.connect(otherAccount).approve(auctionAddress, initialBidPrice);
      await snapitToken.connect(otherAccount2).approve(auctionAddress, secondBidPrice);
    
      // otherAccount and otherAccount2 approve the auction contract to transfer snapitToken on their behalf
      // await snapitNft.connect(otherAccount).setApprovalForAll(auctionAddress, true);
      // await snapitNft.connect(otherAccount2).setApprovalForAll(auctionAddress, true);

      await snapitNft.connect(owner).setApprovalForAll(auctionAddress, true);
    
      // Create an auction
      await auction.connect(owner).createAuction(
        tokenId,
        100000, // starting price
        10000,  // minimum price difference
        10000000, // buyout price
        startTime,
        startTime + 3600, // end time
      );
    
      console.log('before first bid')
      // First bid by otherAccount
      await auction.connect(otherAccount).bid(tokenId, initialBidPrice);

      console.log('first bid done')
    
      // Retrieve and verify the auction details after the first bid
      let updatedAuction = await auction.auctions(tokenId);
      expect(updatedAuction.auctionOwner).to.equal(otherAccount.address);
      expect(updatedAuction.bidPrice).to.equal(initialBidPrice);
    
      // Second bid by otherAccount2, should be higher than the first
      await auction.connect(otherAccount2).bid(tokenId, secondBidPrice);
    
      // Retrieve and verify the auction details after the second bid
      updatedAuction = await auction.auctions(tokenId);
      expect(updatedAuction.auctionOwner).to.equal(otherAccount2.address);
      expect(updatedAuction.bidPrice).to.equal(secondBidPrice);
    
      // Additional checks might include verifying the token balances of otherAccount and otherAccount2
      // to ensure that funds were transferred correctly and refunds were processed if necessary.
    });
  })
})

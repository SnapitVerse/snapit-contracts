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

    const Auction = await ethers.getContractFactory('SnapitAuction')
    const auction = await Auction.deploy(snapitTokenAddress, snapitNftAddress)
    const auctionAddress = await auction.getAddress()

    snapitNft.setApprovalForAll(auctionAddress, true)

    return {
      snapitToken,
      snapitNft,
      auction,
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
  })
})

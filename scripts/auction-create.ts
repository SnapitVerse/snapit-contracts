import { ethers } from 'hardhat'
import { Network, getABI, getAddress } from './constants'

async function main() {
  const [owner, otherAccount] = await ethers.getSigners()

  const Address = getAddress(Network.BSC_TEST)
  const ABI = getABI()

  const Auction = await ethers.getContractFactory('SnapitAuction')
  const auctionContract = Auction.attach(Address.auction)

  const startTime = Math.floor(Date.now() / 1000)

  const createAuctionParams = {
    tokenId: 99,
    newStartingPrice: 100000,
    newMinPriceDifference: 10000,
    newBuyoutPrice: 10000000,
    newStartTime: startTime,
    newEndTime: startTime + 3600,
  }

  const response = await (auctionContract as any).createAuction(
    createAuctionParams.tokenId,
    createAuctionParams.newStartingPrice,
    createAuctionParams.newMinPriceDifference,
    createAuctionParams.newBuyoutPrice,
    createAuctionParams.newStartTime,
    createAuctionParams.newEndTime
  )

  // const response = await (auctionContract as any).createAuction(
  //   Object.values(createAuctionParams)
  // )

  console.log('Response: ', response)

  await response.wait()

  console.log('createAuction response: ', response)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

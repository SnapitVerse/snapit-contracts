import { ethers } from 'hardhat'
import { Network, getABI, getAddress } from '../constants'

async function main() {
  const [owner, otherAccount, otherAccount2] = await ethers.getSigners()

  const Address = getAddress(Network.BSC_TEST)
  const ABI = getABI()

  const Auction = await ethers.getContractFactory('SnapitAuction')
  const auctionContract = Auction.attach(Address.auction)

  const SnapitToken = await ethers.getContractFactory('SnapitToken')
  const snapitToken = SnapitToken.attach(Address.snapitToken)

  await (snapitToken as any)
    .connect(otherAccount)
    .approve(Address.auction, 4000000)

  await (snapitToken as any)
    .connect(otherAccount2)
    .approve(Address.auction, 4000000)

  const tokenId = 97

  const firstBidPrice = 120000

  const response1 = await (auctionContract as any)
    .connect(otherAccount)
    .bid(tokenId, firstBidPrice, { gasLimit: 300000 })

  await response1.wait()

  console.log('Response1: ', response1)

  const secondBidPrice = 140000

  const response2 = await (auctionContract as any)
    .connect(otherAccount2)
    .bid(tokenId, secondBidPrice, { gasLimit: 300000 })

  await response2.wait()

  console.log('Response2: ', response2)

  const thirdBidPrice = 160000

  const response3 = await (auctionContract as any)
    .connect(otherAccount)
    .bid(tokenId, thirdBidPrice, { gasLimit: 300000 })

  await response3.wait()

  console.log('Response3: ', response3)

  const buyoutPrice = 2000000
  const response4 = await (auctionContract as any)
    .connect(otherAccount2)
    .bid(tokenId, buyoutPrice, { gasLimit: 300000 })

  await response4.wait()

  console.log('Response: ', response4)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

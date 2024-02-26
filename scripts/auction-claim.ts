import { ethers } from 'hardhat'
import { Network, getABI, getAddress } from './constants'

async function main() {
  const [owner, otherAccount, otherAccount2] = await ethers.getSigners()

  const Address = getAddress(Network.BSC_TEST)
  const ABI = getABI()

  const Auction = await ethers.getContractFactory('SnapitAuction')
  const auctionContract = Auction.attach(Address.auction)

  const tokenId = 97

  const response1 = await (auctionContract as any)
    .connect(otherAccount2)
    .claim(tokenId, { gasLimit: 300000 })

  await response1.wait()

  console.log('Response1: ', response1)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

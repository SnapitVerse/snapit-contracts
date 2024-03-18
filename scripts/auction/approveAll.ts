import { ethers } from 'hardhat'
import { Network, getABI, getAddress } from '../constants'

async function main() {
  const [owner, otherAccount] = await ethers.getSigners()

  const Address = getAddress(Network.BSC_TEST)
  const SnapitNFT = await ethers.getContractFactory('SnapitNFT')

  const snapitNft = SnapitNFT.attach(Address.snapitNFT)

  const response = await (snapitNft as any).setApprovalForAll(
    Address.auction,
    true
  )
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

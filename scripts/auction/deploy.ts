import { ethers } from 'hardhat'
import { Network, getAddress } from '../constants'

async function main() {
  const [owner, otherAccount] = await ethers.getSigners()

  const Address = getAddress(Network.BSC_TEST)

  // localhost contract address: 0x5fbdb2315678afecb367f032d93f642f64180aa3
  const Auction = await ethers.getContractFactory('SnapitAuction')
  const auction = await Auction.deploy(Address.snapitToken, Address.snapitNFT)
  await auction.waitForDeployment()
  console.log('Contract: ', await auction.getAddress())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

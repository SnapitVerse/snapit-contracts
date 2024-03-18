import { ethers } from 'hardhat'

async function main() {
  const [owner, otherAccount] = await ethers.getSigners()

  // localhost contract address: 0x5fbdb2315678afecb367f032d93f642f64180aa3
  const SnapitNFT = await ethers.getContractFactory('SnapitNFT')
  const snapitNft = await SnapitNFT.deploy()
  await snapitNft.waitForDeployment()
  console.log('Contract: ', await snapitNft.getAddress())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

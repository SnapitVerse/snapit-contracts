import { ethers } from 'hardhat'

async function main() {
  const [owner, otherAccount] = await ethers.getSigners()

  // localhost contract address: 0x5fbdb2315678afecb367f032d93f642f64180aa3
  const ERC1155 = await ethers.getContractFactory('SnapitNFT1155')
  const erc1155 = await ERC1155.deploy()
  await erc1155.waitForDeployment()
  console.log('Contract: ', await erc1155.getAddress())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

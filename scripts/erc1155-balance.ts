import { ethers } from 'hardhat'
import { SnapitNFT } from '../typechain-types'

async function main() {
  const [owner, otherAccount] = await ethers.getSigners()

  // localhost contract address: 0x5fbdb2315678afecb367f032d93f642f64180aa3

  const ERC1155 = await ethers.getContractFactory('SnapitNFT')
  const erc1155 = ERC1155.attach(
    '0x5fbdb2315678afecb367f032d93f642f64180aa3'
  ) as SnapitNFT

  const tokenId = 1

  const balance = await erc1155.balanceOf(owner.address, tokenId)

  console.log('Balance: ', balance)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

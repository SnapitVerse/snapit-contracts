import { ethers } from 'hardhat'
import { SnapitNFT } from '../../typechain-types'

async function main() {
  const [owner, otherAccount] = await ethers.getSigners()

  // localhost contract address: 0x5fbdb2315678afecb367f032d93f642f64180aa3

  const SnapitNFT = await ethers.getContractFactory('SnapitNFT')
  const snapitNft = SnapitNFT.attach(
    '0xCEDe92a1D9254A19B7787C568e1f37Ec4cE317fd'
  ) as SnapitNFT

  const tokenId = 1

  const feeNumerator = 500 // Means 5% royalty amount

  const response = await snapitNft.setDefaultRoyalty(owner, feeNumerator)

  await response.wait()

  console.log('mint response: ', response)

  const royaltyInfo = await snapitNft.royaltyInfo(tokenId, 100)

  console.log('royaltyInfo: ', royaltyInfo)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

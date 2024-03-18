import { ethers } from 'hardhat'
import { SnapitNFT } from '../../typechain-types'

async function main() {
  const [owner, otherAccount] = await ethers.getSigners()

  const SnapitNFT = await ethers.getContractFactory('SnapitNFT')
  const snapitNft = SnapitNFT.attach(
    '0xCEDe92a1D9254A19B7787C568e1f37Ec4cE317fd'
  ) as SnapitNFT

  const tokenId = 1

  const royalty = await snapitNft.royaltyInfo(tokenId, 100)

  const tokenUri = await snapitNft.tokenURI(tokenId)
  const contractURI = await snapitNft.contractURI()
  const symbol = await snapitNft.symbol()
  const name = await snapitNft.name()

  console.log('Name: ', name)
  console.log('Symbol: ', symbol)
  console.log('ContractURI: ', contractURI)
  console.log('tokenUri: ', tokenUri)
  console.log('Token Royalty: ', royalty)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

import { ethers } from 'hardhat'
import { SnapitNFT1155 } from '../../typechain-types'

async function main() {
  const [owner, otherAccount] = await ethers.getSigners()

  const ERC1155 = await ethers.getContractFactory('SnapitNFT1155')
  const erc1155 = ERC1155.attach(
    '0x216b99785B2cbD09C9fd72d8B731769900C6FabB'
  ) as SnapitNFT1155

  const tokenId = 1

  const balance = await erc1155.balanceOf(owner.address, tokenId)
  const contractURI = await erc1155.contractURI()
  const tokenUri = await erc1155.uri(tokenId)

  console.log('Balance: ', balance)
  console.log('ContractURI: ', contractURI)
  console.log('tokenUri: ', tokenUri)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

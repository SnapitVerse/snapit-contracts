import { ethers } from 'hardhat'
import * as crypto from 'crypto'
import { SnapitNFT } from '../typechain-types'

function generateMetadataHash(metadata: object): string {
  // Convert the metadata object to a JSON string
  const metadataString = JSON.stringify(metadata)

  // Create a SHA-256 hash of the JSON string
  const hash = crypto.createHash('sha256')
  hash.update(metadataString)
  const hashString = hash.digest('hex')

  return hashString.startsWith('0x') ? hashString : `0x${hashString}`
}

async function main() {
  const [owner, otherAccount] = await ethers.getSigners()

  // localhost contract address: 0x5fbdb2315678afecb367f032d93f642f64180aa3

  const ERC1155 = await ethers.getContractFactory('SnapitNFT')
  const erc1155 = ERC1155.attach(
    '0x5fbdb2315678afecb367f032d93f642f64180aa3'
  ) as SnapitNFT

  const tokenId = 25
  const metadata = {
    name: 'testNFT',
  }

  const metadataHash = generateMetadataHash(metadata)

  console.log('Metadata Hash: ', metadataHash)

  let data = ethers.getBytes(metadataHash)

  const response = await erc1155.mintUniqueToken(owner.address, tokenId, data)

  await response.wait()

  console.log('mint response: ', response)
  console.log('pipisim')

  const balance = await erc1155.balanceOf(owner.address, tokenId)

  console.log('Balance: ', balance.toString())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

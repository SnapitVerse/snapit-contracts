import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import * as crypto from 'crypto'

function generateMetadataHash(metadata: object): string {
  // Convert the metadata object to a JSON string
  const metadataString = JSON.stringify(metadata)

  // Create a SHA-256 hash of the JSON string
  const hash = crypto.createHash('sha256')
  hash.update(metadataString)
  const hashString = hash.digest('hex')

  return hashString.startsWith('0x') ? hashString : `0x${hashString}`
}

describe('SnapitNFT', function () {
  async function deployToken() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners()

    const ERC1155 = await ethers.getContractFactory('SnapitNFT')
    const erc1155 = await ERC1155.deploy()

    return { erc1155, owner, otherAccount }
  }

  describe('Deployment', function () {
    it('Should deploy the contract with expected values', async function () {
      const { erc1155, owner } = await loadFixture(deployToken)
      const tokenId = 1
      const readURI = (await erc1155.uri(tokenId)).replace(
        '{id}',
        tokenId.toString()
      )
      console.log('URI: ', readURI)
    })

    it('Should be able to mint', async function () {
      const { erc1155, owner } = await loadFixture(deployToken)
      const tokenId = 1

      const metadata = {
        name: 'testNFT',
      }

      const metadataHash = generateMetadataHash(metadata)

      console.log('Metadata Hash: ', metadataHash)

      let data = ethers.getBytes(metadataHash)

      const readURI = await erc1155.mintUniqueToken(
        owner.address,
        tokenId,
        data
      )
      console.log('URI: ', readURI)
    })

    it('Should be able to mint', async function () {
      const { erc1155, owner } = await loadFixture(deployToken)
      const tokenId = 1

      const metadata = {
        name: 'testNFT',
      }

      const metadataHash = generateMetadataHash(metadata)

      console.log('Metadata Hash: ', metadataHash)

      let data = ethers.getBytes(metadataHash)

      const readURI = await erc1155.mintUniqueToken(
        owner.address,
        tokenId,
        data
      )
      console.log('URI: ', readURI)
    })
  })
})

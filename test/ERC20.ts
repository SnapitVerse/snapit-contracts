import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('ERC20', function () {
  async function deployToken() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners()

    const ERC20 = await ethers.getContractFactory('SnapitToken')
    const erc20 = await ERC20.deploy()

    return { erc20, owner, otherAccount }
  }

  describe('Deployment', function () {
    it('Should deploy the contract with expected values', async function () {
      const { erc20, owner } = await loadFixture(deployToken)
      const readName = await erc20.name()
      const readSymbol = await erc20.symbol()
      const readOwnerBalance = await erc20.balanceOf(owner)
      expect(readName).to.be.equal('SnapIt')
      expect(readSymbol).to.be.equal('SNPT')
      expect(readOwnerBalance).to.be.equal(1_000_000_000)
    })
  })
})

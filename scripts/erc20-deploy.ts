import { ethers } from 'hardhat'

async function main() {
  const [owner] = await ethers.getSigners()

  // bscTest snapitToken contract address: 0x8d809eC21EDDdc73ed8629A4E9B3E73169A20e36
  const ERC20 = await ethers.getContractFactory('SnapitToken')
  const erc20 = await ERC20.deploy()
  await erc20.waitForDeployment()

  console.log('Contract address: ', await erc20.getAddress())

  console.log('Owner balance: ', await erc20.balanceOf(owner))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

import { ethers } from 'hardhat'
import { Fee, Network, getAddress } from '../constants'
import { createPool } from '../operations/createPool'

async function main() {
  const [owner] = await ethers.getSigners()

  const network: Network = Network.BSC_TEST
  const Address = getAddress(network)
  const fee = Fee._0_05

  const snapitAmount = ethers.parseUnits('1000', 18)
  const usdcAmount = ethers.parseUnits('40', 18)
  await createPool(
    Address.snapitToken,
    Address.usdc,
    snapitAmount,
    usdcAmount,
    fee,
    network,
    owner
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

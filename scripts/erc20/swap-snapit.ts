import { ethers } from 'hardhat'
import { Fee, Network, getAddress } from '../constants'
import { swapTokens } from '../operations/swapTokens'

async function main() {
  const [owner] = await ethers.getSigners()

  const network: Network = Network.BSC_MAIN

  const Address = getAddress(network)

  const usdcAmount = ethers.parseUnits('10', 18)

  await swapTokens(
    Address.usdc,
    Address.snapitToken,
    usdcAmount,
    Fee._0_05,
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

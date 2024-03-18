import { ethers } from 'hardhat'
import { Fee, Network, getAddress } from '../constants'
import { swapTokensWithNative } from '../operations/swapTokensWithNative'

async function main() {
  const [owner] = await ethers.getSigners()

  console.log('Owner Address: ', owner.address)

  const network: Network = Network.BSC_TEST

  const Address = getAddress(network)

  const wbnbAmount = ethers.parseUnits('0.5', 18)

  await swapTokensWithNative(
    Address.wbnb,
    Address.usdc,
    wbnbAmount,
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

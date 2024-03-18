import { ethers } from 'hardhat'
import { Fee, Network, getAddress } from '../constants'

import { addLiquidity } from '../operations/addLiquidity'

async function main() {
  const [owner] = await ethers.getSigners()

  const network: Network = Network.BSC_TEST

  const Address = getAddress(network)

  const fee = Fee._0_05

  const snapitAmount = ethers.parseUnits('100', 18)
  const usdcAmount = ethers.parseUnits('4', 18)

  const slippage = 10

  await addLiquidity(
    Address.usdc,
    Address.snapitToken,

    usdcAmount,
    snapitAmount,
    fee,
    slippage,
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

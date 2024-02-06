import { ethers } from 'hardhat'

import { Bsc_Test } from '../contracts/Pancake/addresses.json'

const { PancakeV3Factory: FACTORY_ADDRESS, SwapRouter: SWAP_ROUTER_ADDRESS } =
  Bsc_Test

import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from '@pancakeswap/v3-core/artifacts/contracts/PancakeV3Factory.sol/PancakeV3Factory.json'

async function main() {
  const [owner] = await ethers.getSigners()

  const provider = ethers.provider

  const factoryContract = new ethers.Contract(
    FACTORY_ADDRESS,
    FACTORY_ABI,
    owner
  )

  const fee = 10000

  const snapitTokenAddress = '0x8d809eC21EDDdc73ed8629A4E9B3E73169A20e36'

  const usdcAddress = '0x64544969ed7EBf5f083679233325356EbE738930'

  const tx = await factoryContract.createPool(
    snapitTokenAddress,
    usdcAddress,
    fee
  )
  await tx.wait()

  const poolAddress = await factoryContract.getPool(
    snapitTokenAddress,
    usdcAddress,
    fee
  )

  console.log('Pool Adress: ', poolAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

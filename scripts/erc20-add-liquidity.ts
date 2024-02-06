import { ethers } from 'hardhat'

import { Bsc_Test } from '../contracts/Pancake/addresses.json'

const {
  PancakeV3Factory: FACTORY_ADDRESS,
  SwapRouter: SWAP_ROUTER_ADDRESS,
  NonfungiblePositionManager: NONFUNGIBLE_POS_MANAGER_ADDRESS,
} = Bsc_Test

import { abi as FACTORY_ABI } from '@pancakeswap/v3-core/artifacts/contracts/PancakeV3Factory.sol/PancakeV3Factory.json'

import { abi as MANAGER_ABI } from '@pancakeswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import { ERC20__factory } from '../typechain-types'

async function main() {
  const [owner] = await ethers.getSigners()

  const provider = ethers.provider

  const factoryContract = new ethers.Contract(
    FACTORY_ADDRESS,
    FACTORY_ABI,
    owner
  )

  const snapitTokenAddress = '0x8d809eC21EDDdc73ed8629A4E9B3E73169A20e36'

  const usdcAddress = '0x64544969ed7EBf5f083679233325356EbE738930'

  const fee = 10000

  const poolAddress = await factoryContract.getPool(
    snapitTokenAddress,
    usdcAddress,
    fee
  )

  console.log('Pool address: ', poolAddress)

  const positionManagerContract = new ethers.Contract(
    NONFUNGIBLE_POS_MANAGER_ADDRESS,
    MANAGER_ABI,
    owner
  )

  const tokenAContract = new ethers.Contract(
    snapitTokenAddress,
    ERC20__factory.abi,
    owner
  )
  const tokenBContract = new ethers.Contract(
    usdcAddress,
    ERC20__factory.abi,
    owner
  )

  await tokenAContract.approve(
    NONFUNGIBLE_POS_MANAGER_ADDRESS,
    ethers.MaxUint256
  )
  await tokenBContract.approve(
    NONFUNGIBLE_POS_MANAGER_ADDRESS,
    ethers.MaxUint256
  )

  const amountADesired = ethers.parseUnits('1', 18) // 1000 DAI with 18 decimals
  const amountBDesired = ethers.parseUnits('0.04', 18) // 1000 USDC with 6 decimals

  const slippageTolerance = ethers.toBigInt(1) // 1%
  const base = ethers.toBigInt(100)

  // Calculate minimum amounts considering slippage tolerance
  const amountAMin =
    amountADesired - (amountADesired * slippageTolerance) / base
  const amountBMin =
    amountBDesired - (amountBDesired * slippageTolerance) / base

  const mintParams = {
    token0: snapitTokenAddress,
    token1: usdcAddress,
    fee,
    tickLower: -8872,
    tickUpper: 8872,
    amount0Desired: amountADesired,
    amount1Desired: amountBDesired,
    amount0Min: amountAMin,
    amount1Min: amountBMin,
    recipient: owner.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    // You might need to add or adjust parameters based on the specific implementation
  }

  // const mintParams = {
  //   token0: usdcAddress,
  //   token1: snapitTokenAddress,
  //   fee,
  //   tickLower: -887220,
  //   tickUpper: 887220,
  //   amount0Desired: amountBDesired,
  //   amount1Desired: amountADesired,
  //   amount0Min: amountBMin,
  //   amount1Min: amountAMin,
  //   recipient: owner.address,
  //   deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
  //   // You might need to add or adjust parameters based on the specific implementation
  // }

  const tx = await positionManagerContract.mint(mintParams)
  await tx.wait()
  console.log(`Liquidity added. Transaction hash: ${tx.hash}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

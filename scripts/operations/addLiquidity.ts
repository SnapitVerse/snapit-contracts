import { ethers } from 'hardhat'
import {
  Fee,
  Network,
  getABI,
  getAddress,
  getChainId,
  getFeeValue,
  getTickSpacing,
} from '../constants'
import { Price, Token } from '@uniswap/sdk-core'
import { priceToClosestTick } from '../helpers'
import { TickMath, nearestUsableTick } from '@uniswap/v3-sdk'

export async function addLiquidity(
  token0: string,
  token1: string,
  amount0: bigint,
  amount1: bigint,
  fee: Fee,
  slippagePercentage: number,
  network: Network,
  runner: any
) {
  const Address = getAddress(network)
  const ABI = getABI()

  const factoryContract = new ethers.Contract(
    Address.pancakeV3Factory,
    ABI.pancakeV3Factory,
    runner
  )
  const feeValue = getFeeValue(fee)

  const poolAddress = await factoryContract.getPool(token0, token1, feeValue)

  console.log('Pool address: ', poolAddress)

  const positionManagerContract = new ethers.Contract(
    Address.nonfungiblePositionManager,
    ABI.nonfungiblePositionManager,
    runner
  )

  const token0Contract = new ethers.Contract(token0, ABI.erc20, runner)

  const token1Contract = new ethers.Contract(token1, ABI.erc20, runner)

  const token0Presicion = Number(await token0Contract.decimals())
  const token1Presicion = Number(await token1Contract.decimals())

  await token0Contract.approve(
    Address.nonfungiblePositionManager,
    ethers.MaxUint256
  )
  await token1Contract.approve(
    Address.nonfungiblePositionManager,
    ethers.MaxUint256
  )

  const slippageTolerance = ethers.toBigInt(slippagePercentage)
  const base = ethers.toBigInt(100)

  // Calculate minimum amounts considering slippage tolerance
  const token0Min = amount0 - (amount0 * slippageTolerance) / base
  const token1Min = amount1 - (amount1 * slippageTolerance) / base
  const token1Max = amount1 + (amount1 * slippageTolerance) / base

  const tickSpacing = getTickSpacing(fee)

  const chainId = getChainId(network)

  // Define your tokens
  const token0Token = new Token(chainId, token0, token0Presicion)
  const token1Token = new Token(chainId, token1, token1Presicion)

  // Define your desired price range
  const minPrice = new Price(
    token0Token,
    token1Token,
    amount0.toString(),
    token1Min.toString()
  ) // Price object for the minimum price
  const maxPrice = new Price(
    token0Token,
    token1Token,
    amount0.toString(),
    token1Max.toString()
  ) // Price object for the maximum price

  const lowerClosestTick = priceToClosestTick(minPrice)
  const upperClosestTick = priceToClosestTick(maxPrice)

  const sqrtPriceX96Lower = TickMath.getSqrtRatioAtTick(lowerClosestTick)
  const sqrtPriceX96Upper = TickMath.getSqrtRatioAtTick(upperClosestTick)

  // Calculate the nearest usable ticks for your price range, aligned with tick spacing
  const tickLower = nearestUsableTick(
    TickMath.getTickAtSqrtRatio(sqrtPriceX96Lower),
    tickSpacing
  )
  const tickUpper = nearestUsableTick(
    TickMath.getTickAtSqrtRatio(sqrtPriceX96Upper),
    tickSpacing
  )

  console.log('tickLower: ', tickLower)
  console.log('tickUpper: ', tickUpper)

  const mintParams = {
    token0,
    token1,
    fee: feeValue,
    tickLower,
    tickUpper,
    amount0Desired: amount0,
    amount1Desired: amount1,
    amount0Min: token0Min,
    amount1Min: token1Min,
    recipient: runner.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    // You might need to add or adjust parameters based on the specific implementation
  }

  const tx = await positionManagerContract.mint(mintParams, {
    gasLimit: 30000000,
  })
  console.log(`Liquidity added. Transaction hash: ${tx.hash}`)
}

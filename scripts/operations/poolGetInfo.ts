import { ethers } from 'hardhat'
import {
  Fee,
  Network,
  getABI,
  getAddress,
  getChainId,
  getFeeValue,
} from '../constants'
import JSBI from 'jsbi'
import { TickMath } from '@uniswap/v3-sdk'
import { Token } from '@uniswap/sdk-core'
import { tickToPrice } from '../helpers'

interface Slot0Response {
  sqrtPriceX96: BigInt
  // Include other properties returned by slot0() as needed
}

export async function poolGetInfo(
  poolAddress: string,
  network: Network,
  runner: any
) {
  const ABI = getABI()
  const chainId = getChainId(network)
  const poolContract = new ethers.Contract(poolAddress, ABI.pool, runner)

  const token0Address = await poolContract.token0()
  const token1Address = await poolContract.token1()

  const slot0: Slot0Response = await poolContract.slot0()
  const sqrtPriceX96: BigInt = slot0.sqrtPriceX96

  const JSBIBigInt = JSBI.BigInt(sqrtPriceX96.toString())

  const tick = TickMath.getTickAtSqrtRatio(JSBIBigInt)

  const token0Contract = new ethers.Contract(token0Address, ABI.erc20, runner)
  const token1Contract = new ethers.Contract(token1Address, ABI.erc20, runner)

  const token0Presicion = Number(await token0Contract.decimals())
  const token1Presicion = Number(await token1Contract.decimals())

  const token0 = new Token(chainId, token0Address, token0Presicion)
  const token1 = new Token(chainId, token1Address, token1Presicion)

  const price = tickToPrice(token0, token1, tick)

  // Get the liquidity
  const liquidity: BigInt = await poolContract.liquidity()

  return {
    price: price.toFixed(),
    liquidity: liquidity.toString(),
  }
}

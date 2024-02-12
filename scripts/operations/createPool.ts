import { ethers } from 'hardhat'
import {
  Fee,
  Network,
  getABI,
  getAddress,
  getChainId,
  getFeeValue,
} from '../constants'
import { Price, Token } from '@uniswap/sdk-core'
import { priceToClosestTick, updateEnv } from '../helpers'
import { TickMath } from '@uniswap/v3-sdk'

export async function createPool(
  token0: string,
  token1: string,
  amount0: BigInt,
  amount1: BigInt,
  fee: Fee,
  network: Network,
  runner: any
) {
  const chainId = getChainId(network)

  const Address = getAddress(network)
  const ABI = getABI()

  const factoryContract = new ethers.Contract(
    Address.pancakeV3Factory,
    ABI.pancakeV3Factory,
    runner
  )

  const feeValue = getFeeValue(fee)

  const positionManagerContract = new ethers.Contract(
    Address.nonfungiblePositionManager,
    ABI.nonfungiblePositionManager,
    runner
  )

  const token0Contract = new ethers.Contract(token0, ABI.erc20, runner)
  const token1Contract = new ethers.Contract(token1, ABI.erc20, runner)

  const token0Presicion = Number(await token0Contract.decimals())
  const token1Presicion = Number(await token1Contract.decimals())

  // Define your tokens
  const token0Token = new Token(chainId, token0, token0Presicion)
  const token1Token = new Token(chainId, token1, token1Presicion)

  // Define your desired price range
  const price = new Price(
    token0Token,
    token1Token,
    amount0.toString(),
    amount1.toString()
  ) // Price object for the minimum price

  const tick = priceToClosestTick(price)

  const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tick).toString()

  const tx = await (
    positionManagerContract.connect(runner) as any
  ).createAndInitializePoolIfNecessary(token0, token1, feeValue, sqrtPriceX96, {
    gasLimit: 5000000,
  })

  const poolAddress = await factoryContract.getPool(token0, token1, feeValue)

  console.log('Pool Adress: ', poolAddress)
  await updateEnv('POOL_ADDRESS', poolAddress)
}

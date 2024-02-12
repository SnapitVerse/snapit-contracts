import { ethers } from 'hardhat'
import { Fee, Network, getABI, getAddress, getFeeValue } from '../constants'
import { EthereumProvider } from 'hardhat/types'

export async function swapTokens(
  token0: string,
  token1: string,
  amount0: BigInt,
  fee: Fee,
  network: Network,
  runner: any
) {
  const Address = getAddress(network)
  const ABI = getABI()

  const feeValue = getFeeValue(fee)

  const contract0 = new ethers.Contract(token0, ABI.erc20, runner)
  const contract1 = new ethers.Contract(token1, ABI.erc20, runner)

  const usdcBalanceBefore = await contract0.balanceOf(runner.address)
  const snapitBalanceBefore = await contract1.balanceOf(runner.address)

  console.log(
    'token0 balance before: ',
    ethers.formatUnits(usdcBalanceBefore.toString(), 18)
  )
  console.log(
    'token1 balance before: ',
    ethers.formatUnits(snapitBalanceBefore.toString(), 18)
  )

  const routerContract = new ethers.Contract(
    Address.swapRouter,
    ABI.swapRouter,
    runner
  )

  await contract0.approve(Address.swapRouter, ethers.MaxUint256)
  await contract1.approve(Address.swapRouter, ethers.MaxUint256)

  console.log('approved!')

  ethers.provider.send('evm_mine')

  const exactInputSingleParams = {
    tokenIn: token0,
    tokenOut: token1,
    fee: feeValue,
    recipient: runner.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    amountIn: amount0,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  }

  const tx = await (routerContract.connect(runner) as any).exactInputSingle(
    exactInputSingleParams,
    {
      gasLimit: ethers.toBeHex(3000000),
    }
  )

  const usdcBalanceAfter = await contract0.balanceOf(runner.address)
  const snapitBalanceAfter = await contract1.balanceOf(runner.address)

  console.log(
    'token0 balance after: ',
    ethers.formatUnits(usdcBalanceAfter.toString(), 18)
  )
  console.log(
    'token1 balance after: ',
    ethers.formatUnits(snapitBalanceAfter.toString(), 18)
  )
}

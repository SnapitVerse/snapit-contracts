import { Fee, Network, getABI, getAddress, getFeeValue } from '../constants'
import { ethers } from 'hardhat'

export async function swapTokensWithNative(
  wrappedToken: string,
  token1: string,
  wrappedAmount: BigInt,
  fee: Fee,
  network: Network,
  runner: any
) {
  const Address = getAddress(network)
  const ABI = getABI()

  const feeValue = getFeeValue(fee)

  const routerContract = new ethers.Contract(
    Address.swapRouter,
    ABI.swapRouter,
    runner
  )

  const exactInputSingleParams = {
    tokenIn: wrappedToken,
    tokenOut: token1,
    fee: feeValue,
    recipient: runner.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    amountIn: wrappedAmount,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  }

  const data = routerContract.interface.encodeFunctionData('exactInputSingle', [
    exactInputSingleParams,
  ])

  const trxArgs = {
    to: Address.swapRouter,
    from: runner.address,
    data,
    value: wrappedAmount,
    gasLimit: 30000000,
  }

  console.log('Sending transaction...')

  const tx = await runner.sendTransaction(trxArgs)

  const token1Contract = new ethers.Contract(Address.usdc, ABI.usdc, runner)

  const balance = await token1Contract.balanceOf(runner.address)

  console.log('Token1 Balance: ', ethers.formatUnits(balance.toString(), 18))
}

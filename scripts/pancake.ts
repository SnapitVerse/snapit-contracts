import { ethers } from 'hardhat'

import wethAbi from '../contracts/Pancake/weth.json'
const usdcAddress = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
const wethAddress = '0x2170Ed0880ac9A755fd29B2688956BD959F933F8'

import {
  abi as SWAP_ROUTER_ABI,
  bytecode as SWAP_ROUTER_BYTECODE,
} from '@pancakeswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'

import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from '@pancakeswap/v3-core/artifacts/contracts/PancakeV3Factory.sol/PancakeV3Factory.json'

import {
  abi as POOL_ABI,
  bytecode as POOL_BYTECODE,
} from '@pancakeswap/v3-core/artifacts/contracts/PancakeV3Pool.sol/PancakeV3Pool.json'

import { Bsc_Main } from '../contracts/Pancake/addresses.json'
import { ERC20, ERC20__factory, IERC20__factory } from '../typechain-types'

const { PancakeV3Factory: FACTORY_ADDRESS, SwapRouter: SWAP_ROUTER_ADDRESS } =
  Bsc_Main

async function main() {
  const provider = ethers.provider

  const factoryContract = new ethers.Contract(
    FACTORY_ADDRESS,
    FACTORY_ABI,
    provider
  )

  const poolAddress = await factoryContract.getPool(
    wethAddress,
    usdcAddress,
    '500'
  )
  console.log('poolAddress', poolAddress)

  const signerAddress = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'
  const signer = await ethers.getImpersonatedSigner(signerAddress)
  // const wethContract = await ethers.getContractAt('ERC20', wethAddress)
  // const usdcContract = await ethers.getContractAt('ERC20', usdcAddress)

  // const wethContract = ERC20__factory.connect(wethAddress) as ERC20

  // const usdcContract = ERC20__factory.connect(usdcAddress) as ERC20

  const wethContract = new ethers.Contract(
    wethAddress,
    ERC20__factory.abi,
    provider
  )
  const usdcContract = new ethers.Contract(
    usdcAddress,
    ERC20__factory.abi,
    provider
  )

  const amountIn = ethers.parseUnits('0.01', 18)

  await (wethContract.connect(signer) as any).approve(
    SWAP_ROUTER_ADDRESS,
    amountIn.toString()
  )
  console.log('approved!')

  const smartRouterContract = new ethers.Contract(
    SWAP_ROUTER_ADDRESS,
    SWAP_ROUTER_ABI,
    provider
  )

  const params = {
    tokenIn: wethAddress,
    tokenOut: usdcAddress,
    fee: '500',
    recipient: signerAddress,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  }

  let wethBalance
  let usdcBalance
  wethBalance = await wethContract.balanceOf(signerAddress)
  usdcBalance = await usdcContract.balanceOf(signerAddress)
  console.log('================= BEFORE SWAP')
  console.log('wethBalance:', ethers.formatUnits(wethBalance.toString(), 18))
  console.log('usdcBalance:', ethers.formatUnits(usdcBalance.toString(), 6))

  const tx = (
    (await smartRouterContract.connect(signer)) as any
  ).exactInputSingle(params, {
    gasLimit: ethers.toBeHex(1000000),
  })
  // await tx.wait()

  wethBalance = await wethContract.balanceOf(signerAddress)
  usdcBalance = await usdcContract.balanceOf(signerAddress)
  console.log('================= AFTER SWAP')
  console.log('wethBalance:', ethers.formatUnits(wethBalance.toString(), 18))
  console.log('usdcBalance:', ethers.formatUnits(usdcBalance.toString(), 6))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

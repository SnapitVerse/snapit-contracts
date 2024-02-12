import { ethers } from 'hardhat'

import { Network, getABI, getAddress } from './constants'

async function main() {
  const provider = ethers.provider

  const network: Network = Network.BSC_MAIN

  const Address = getAddress(network)
  const ABI = getABI()

  const factoryContract = new ethers.Contract(
    Address.pancakeV3Factory,
    ABI.pancakeV3Factory,
    provider
  )

  const poolAddress = await factoryContract.getPool(
    Address.wbnb,
    Address.usdc,
    '500'
  )
  console.log('poolAddress', poolAddress)

  const signerAddress = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'
  const signer = await ethers.getImpersonatedSigner(signerAddress)

  const wbnbContract = new ethers.Contract(Address.wbnb, ABI.wbnb, provider)
  const usdcContract = new ethers.Contract(Address.usdc, ABI.usdc, provider)

  const amountIn = ethers.parseUnits('0.01', 6)

  await (wbnbContract.connect(signer) as any).approve(
    Address.smartRouter,
    amountIn.toString()
  )
  await (usdcContract.connect(signer) as any).approve(
    Address.smartRouter,
    amountIn.toString()
  )
  console.log('approved!')

  const smartRouterContract = new ethers.Contract(
    Address.swapRouter,
    ABI.swapRouter,
    provider
  )

  const params = {
    tokenIn: Address.usdc,
    tokenOut: Address.wbnb,
    fee: '500',
    recipient: signerAddress,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  }

  let wethBalance
  let usdcBalance
  wethBalance = await wbnbContract.balanceOf(signerAddress)
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

  wethBalance = await wbnbContract.balanceOf(signerAddress)
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

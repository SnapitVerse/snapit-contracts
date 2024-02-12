import { ethers } from 'hardhat'

import { Bsc_Main, Bsc_Test } from '../contracts/Pancake/addresses.json'

import { abi as FACTORY_ABI } from '@pancakeswap/v3-core/artifacts/contracts/PancakeV3Factory.sol/PancakeV3Factory.json'
import { abi as SWAP_ROUTER_ABI } from '@pancakeswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'
import { abi as MANAGER_ABI } from '@pancakeswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import { abi as POOL_ABI } from '@pancakeswap/v3-core/artifacts/contracts/PancakeV3Pool.sol/PancakeV3Pool.json'

import { ERC20__factory } from '../typechain-types'

import SnapitNFT_ABI from '../artifacts/contracts/SnapitNFT.sol/SnapitNFT.json'
import SnapitToken_ABI from '../artifacts/contracts/SnapitToken.sol/SnapitToken.json'

import WETH9_ABI from '../contracts/Pancake/weth9.json'

const {
  BSC_MAIN_USDC_TOKEN_ADDRESS,
  BSC_MAIN_WBNB_TOKEN_ADDRESS,
  BSC_MAIN_SNAPIT_TOKEN_ADDRESS,
  BSC_TEST_SNAPIT_TOKEN_ADDRESS,
  BSC_TEST_USDC_TOKEN_ADDRESS,
  BSC_TEST_WBNB_TOKEN_ADDRESS,
} = process.env

export enum Network {
  BSC_MAIN,
  BSC_TEST,
}

export const getChainId = (network: Network) => {
  let id
  switch (network) {
    case Network.BSC_MAIN:
      id = 56
      break
    case Network.BSC_TEST:
      id = 97
      break
  }
  return id
}

export enum Fee {
  _0_05,
  _0_30,
  _1_00,
}

export const getFeeValue = (fee: Fee) => {
  let value
  switch (fee) {
    case Fee._0_05:
      value = 500
      break
    case Fee._0_30:
      value = 3000
      break
    case Fee._1_00:
      value = 10000
      break
    default:
      throw Error('Invalid Fee')
  }
  return value
}

export const getTickSpacing = (fee: Fee) => {
  let tickSpacing

  switch (fee) {
    case Fee._0_05:
      tickSpacing = 10
      break
    case Fee._0_30:
      tickSpacing = 60
      break
    case Fee._1_00:
      tickSpacing = 200
      break
    default:
      throw Error('Invalid Fee')
  }
  return tickSpacing
}

export const getAddress = (network: Network): Addresses => {
  let result: Addresses
  switch (network) {
    case Network.BSC_MAIN:
      result = {
        masterChefV3: Bsc_Main.MasterChefV3,
        smartRouter: Bsc_Main.SmartRouter,
        smartRouterHelper: Bsc_Main.SmartRouterHelper,
        mixedRouteQuoterV1: Bsc_Main.MixedRouteQuoterV1,
        quoterV2: Bsc_Main.QuoterV2,
        tokenValidator: Bsc_Main.TokenValidator,
        pancakeV3Factory: Bsc_Main.PancakeV3Factory,
        pancakeV3PoolDeployer: Bsc_Main.PancakeV3PoolDeployer,
        swapRouter: Bsc_Main.SwapRouter,
        v3Migrator: Bsc_Main.V3Migrator,
        tickLens: Bsc_Main.TickLens,
        nonfungibleTokenPositionDescriptor:
          Bsc_Main.NonfungibleTokenPositionDescriptor,
        nonfungiblePositionManager: Bsc_Main.NonfungiblePositionManager,
        pancakeInterfaceMulticall: Bsc_Main.PancakeInterfaceMulticall,
        pancakeV3LmPoolDeployer: Bsc_Main.PancakeV3LmPoolDeployer,
        snapitToken: BSC_MAIN_SNAPIT_TOKEN_ADDRESS as string,
        usdc: BSC_MAIN_USDC_TOKEN_ADDRESS as string,
        wbnb: BSC_MAIN_WBNB_TOKEN_ADDRESS as string,
      }
      break
    case Network.BSC_TEST:
      result = {
        masterChefV3: Bsc_Test.MasterChefV3,
        smartRouter: Bsc_Test.SmartRouter,
        smartRouterHelper: Bsc_Test.SmartRouterHelper,
        mixedRouteQuoterV1: Bsc_Test.MixedRouteQuoterV1,
        quoterV2: Bsc_Test.QuoterV2,
        tokenValidator: Bsc_Test.TokenValidator,
        pancakeV3Factory: Bsc_Test.PancakeV3Factory,
        pancakeV3PoolDeployer: Bsc_Test.PancakeV3PoolDeployer,
        swapRouter: Bsc_Test.SwapRouter,
        v3Migrator: Bsc_Test.V3Migrator,
        tickLens: Bsc_Test.TickLens,
        nonfungibleTokenPositionDescriptor:
          Bsc_Test.NonfungibleTokenPositionDescriptor,
        nonfungiblePositionManager: Bsc_Test.NonfungiblePositionManager,
        pancakeInterfaceMulticall: Bsc_Test.PancakeInterfaceMulticall,
        pancakeV3LmPoolDeployer: Bsc_Test.PancakeV3LmPoolDeployer,
        snapitToken: BSC_TEST_SNAPIT_TOKEN_ADDRESS as string,
        usdc: BSC_TEST_USDC_TOKEN_ADDRESS as string,
        wbnb: BSC_TEST_WBNB_TOKEN_ADDRESS as string,
      }
      break
  }
  return result
}

export const getABI = (): ABIs => {
  const result: ABIs = {
    swapRouter: SWAP_ROUTER_ABI,
    pancakeV3Factory: FACTORY_ABI,
    nonfungiblePositionManager: MANAGER_ABI,
    pool: POOL_ABI,
    snapitToken: SnapitToken_ABI,
    snapitNFT: SnapitNFT_ABI,
    usdc: ERC20__factory.abi,
    wbnb: WETH9_ABI,
    erc20: ERC20__factory.abi,
  }
  return result
}

type Addresses = {
  masterChefV3: string
  smartRouter: string
  smartRouterHelper: string
  mixedRouteQuoterV1: string
  quoterV2: string
  tokenValidator: string
  pancakeV3Factory: string
  pancakeV3PoolDeployer: string
  swapRouter: string
  v3Migrator: string
  tickLens: string
  nonfungibleTokenPositionDescriptor: string
  nonfungiblePositionManager: string
  pancakeInterfaceMulticall: string
  pancakeV3LmPoolDeployer: string
  snapitToken: string
  usdc: string
  wbnb: string
}

type ABIs = {
  swapRouter: any
  pancakeV3Factory: any
  nonfungiblePositionManager: any
  pool: any
  wbnb: any
  usdc: any
  snapitToken: any
  snapitNFT: any
  erc20: any
}

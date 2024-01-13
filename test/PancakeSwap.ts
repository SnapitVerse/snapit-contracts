import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import WETH9 from './WETH9.json'

import factoryArtifact from '@uniswap/v2-core/build/UniswapV2Factory.json'
import routerArtifact from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import pairArtifact from '@uniswap/v2-periphery/build/IUniswapV2Pair.json'

type DeployResults = {
  owner: any
  otherAccount: any
  snapit: any
  snapitAddress: string
  test: any
  testAddress: string
  router: any
  routerAddress: string
  pair: any
  logBalance: any
}

describe('PancakeSwap', function () {
  async function deployToken(): Promise<DeployResults> {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, otherAccount2] = await ethers.getSigners()

    const Snapit = await ethers.getContractFactory('SnapitToken')
    const snapit = await Snapit.deploy()
    const snapitAddress = await snapit.getAddress()
    const Test = await ethers.getContractFactory('TestToken')
    const test = await Test.deploy()
    const testAddress = await test.getAddress()

    const Factory = await ethers.getContractFactory(
      factoryArtifact.abi,
      factoryArtifact.bytecode,
      owner
    )
    const Router = await ethers.getContractFactory(
      routerArtifact.abi,
      routerArtifact.bytecode,
      owner
    )
    const Pair = await ethers.getContractFactory(
      pairArtifact.abi,
      pairArtifact.bytecode,
      owner
    )

    const factory = await Factory.deploy(owner.address)
    const factoryAddress = await factory.getAddress()

    const tx1 = await (factory as any).createPair(snapitAddress, testAddress)
    await tx1.wait()
    const pairAddress = await (factory as any).getPair(
      snapitAddress,
      testAddress
    )

    const pair = new ethers.Contract(pairAddress, pairArtifact.abi, owner)

    const Weth = await ethers.getContractFactory(
      WETH9.abi,
      WETH9.bytecode,
      owner
    )
    const weth = await Weth.deploy()
    const wethAddress = await weth.getAddress()

    const router = await Router.deploy(factoryAddress, wethAddress)
    await router.waitForDeployment()
    const routerAddress = await router.getAddress()

    const logBalance = async (signerObj: typeof owner, name: string) => {
      let ethBalance
      let snapitBalance
      let testBalance
      let balances
      ethBalance = await signerObj.provider.getBalance(signerObj.address)
      snapitBalance = await snapit.balanceOf(signerObj.address)
      testBalance = await test.balanceOf(signerObj.address)
      balances = {
        ethBalance: ethBalance,
        snapitBalance: snapitBalance,
        testBalance: testBalance,
      }
      console.log(`Balances of ${name}: `, balances)
    }

    return {
      owner,
      otherAccount,
      snapit,
      snapitAddress,
      test,
      testAddress,
      router,
      routerAddress,
      pair,
      logBalance,
    }
  }

  describe('Add liquidity and swap', function () {
    let owner: any,
      otherAccount: any,
      snapit: any,
      snapitAddress: string,
      test: any,
      testAddress: string,
      router: any,
      routerAddress: string,
      pair: any,
      logBalance: any

    this.beforeAll(async function () {
      ;({
        owner,
        otherAccount,
        snapit,
        snapitAddress,
        test,
        testAddress,
        router,
        routerAddress,
        pair,
        logBalance,
      } = await loadFixture(deployToken))
    })

    it('Add liquidity', async function () {
      const amount1 = ethers.parseUnits('1000000', 'wei')
      const amount2 = ethers.parseUnits('1000000', 'wei')

      const deadline = Math.floor(Date.now() / 100 + 10 * 60)

      const approval1 = await snapit
        .connect(owner)
        .approve(routerAddress, ethers.MaxUint256)
      await approval1.wait()
      const approval2 = await test
        .connect(owner)
        .approve(routerAddress, ethers.MaxUint256)
      await approval2.wait()

      let reserves

      reserves = await pair.getReserves()

      const addLiquidityTx = await (router.connect(owner) as any).addLiquidity(
        snapitAddress,
        testAddress,
        amount1,
        amount2,
        0,
        0,
        owner.address,
        deadline,
        { gasLimit: 1000000 }
      )

      await addLiquidityTx.wait()

      reserves = await pair.getReserves()

      expect(reserves[0]).to.be.equal(1000000)
      expect(reserves[1]).to.be.equal(1000000)

      logBalance(owner, 'owner')
      logBalance(otherAccount, 'otherAccount')
    })

    it('Swap token', async function () {
      const transferTrx = await snapit
        .connect(owner)
        .transfer(otherAccount.address, ethers.parseUnits('10000', 'wei'))
      const transferTrx2 = await test
        .connect(owner)
        .transfer(otherAccount.address, ethers.parseUnits('10000', 'wei'))

      const approval1 = await snapit
        .connect(otherAccount)
        .approve(routerAddress, ethers.MaxUint256)
      await approval1.wait()
      const approval2 = await test
        .connect(otherAccount)
        .approve(routerAddress, ethers.MaxUint256)
      await approval2.wait()

      const tx = await (
        router.connect(otherAccount) as any
      ).swapExactTokensForTokens(
        ethers.parseUnits('5000', 'wei'),
        0,
        [snapitAddress, testAddress],
        otherAccount.address,
        Math.floor(Date.now() / 1000) + 60 * 10,
        {
          gasLimit: 1000000,
        }
      )

      await tx.wait()
      await logBalance(otherAccount, 'otherAccount')
    })
  })
})

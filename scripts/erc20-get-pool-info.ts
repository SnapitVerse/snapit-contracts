import { ethers } from 'hardhat'
import { Network } from './constants'

import dotenv from 'dotenv'
import { poolGetInfo } from './operations/poolGetInfo'

dotenv.config({ path: 'scripts/.temp.env' })

const { POOL_ADDRESS } = process.env

const network: Network = Network.BSC_MAIN

async function main() {
  const [owner] = await ethers.getSigners()

  const poolInfo = await poolGetInfo(POOL_ADDRESS as string, network, owner)
  console.log('Pool Info: ', poolInfo)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

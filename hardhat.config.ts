import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import dotenv from 'dotenv'

dotenv.config()

const { BSC_MAIN_RPC_URL, BSC_TEST_RPC_URL } = process.env
// import "uniswap-v2-deploy-plugin";

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      mining: {
        auto: true, // disable automatic mining
        interval: [10000, 15000], // Random interval for automatic block mining (in milliseconds)
      },
    },
    sepolia: {
      url: 'https://sepolia.infura.io/v3/614ac29753474b5ca285315d4ea69919',
      accounts: [
        'd3d3901dc47581b61dc9c5b0716662bc6f1369cefa1a714c939fd8ae467a250c',
      ],
    },
    local: {
      url: 'http://localhost:8545',
    },
    binanceMainFork: {
      url: 'http://localhost:8545',
      forking: {
        url: BSC_MAIN_RPC_URL as string,
      },
    },
    binanceTestFork: {
      url: 'http://localhost:8545',
      forking: {
        url: BSC_TEST_RPC_URL as string,
      },
    },
    bscTest: {
      url: BSC_TEST_RPC_URL,
      accounts: [
        '3765ae92eec18f50c24b230a3f0c7c75868f9c898985d1dec97845df1a54fd16',
      ],
    },
  },
  etherscan: {
    //BscScan
    apiKey: 'QXARK1W8HFXQKFDE7VU1WBQM7ZSBS9BK5A',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.20',
      },
    ],
  },
}

export default config

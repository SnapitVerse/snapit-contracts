import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-verify'
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
      url: 'https://eth-sepolia.g.alchemy.com/v2/dvVBC03lxDbreeq8lrRbKgqLT6xoTZiy',
      accounts: [
        '3765ae92eec18f50c24b230a3f0c7c75868f9c898985d1dec97845df1a54fd16',
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
        'd3d3901dc47581b61dc9c5b0716662bc6f1369cefa1a714c939fd8ae467a250c',
        '0bc7f2cacab97cb227658d88280e0118926c20a0ca27461e97cb39a028833425',
      ],
    },
    bscMain: {
      url: BSC_MAIN_RPC_URL,
      accounts: [
        '3765ae92eec18f50c24b230a3f0c7c75868f9c898985d1dec97845df1a54fd16',
        'd3d3901dc47581b61dc9c5b0716662bc6f1369cefa1a714c939fd8ae467a250c',
        '0bc7f2cacab97cb227658d88280e0118926c20a0ca27461e97cb39a028833425',
      ],
    },
  },
  etherscan: {
    //BscScan
    apiKey: 'DIDPXSQEVZ3C7M43BCKY51TJJTGZA9A3ZE',
  },
  // sourcify: {
  //   enabled: true,
  // },
  solidity: {
    compilers: [
      {
        version: '0.8.20',
      },
    ],
  },
}

export default config

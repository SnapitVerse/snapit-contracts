import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
// import "uniswap-v2-deploy-plugin";

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      mining: {
        auto: true, // disable automatic mining
        interval: [5000, 6000], // Random interval for automatic block mining (in milliseconds)
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

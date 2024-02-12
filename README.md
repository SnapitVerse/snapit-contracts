# Snapit Contracts

This project involves contract definitions, unit tests and integration test and production deployment scripts.

### Prerequisites:

- Install latest Nodejs https://nodejs.org/en/download

- Install dependencies in the project's root directory

```
npm install
```

### Basic Commands

```javascript
npx hardhat compile //to compile contracts
npx hardhat test //run all unit tests written under tests/ folder
```

### Integration tests

Although it's not the only way, it is common practice to run integration tests using a local evm blockchain. To run it:

```javascript
npx hardhat node //Runs an empty chain from scratch

npx hardhat node --fork "https://bsc-dataseed1.binance.org" //Forks existing blockchain (Binance Testnet) from latest block and runs on local
```

As seen above there 2 main ways to run local blockchain instance, both comes handy in different scenarios.

#### To run state independent scripts like:

- ERC20 Token Deploy ( ./scripts/erc20-deploy.ts )
- ERC1155 Token Deploy ( ./scripts/erc1155-deploy.ts )
- ERC1155 Token Mint ( ./scripts/erc1155-mint.ts )
- ERC1155 Token Transfer ( ./scripts/erc1155-transfer.ts )

Running an empty blockchain from scratch works just fine. However, some scripts require a setup like creating a pancakeswap v3 pool and adding liquidity. These operations interacts with bunch of other pre-setup contracts that is already deployed to public blockchains like Binance Smart Chain and BCS Testnet, it makes more sense to fork those chains on local to test those scripts.

#### To run pancakeswap dependent scripts like:

- ERC20 Create Pool ( ./scripts/erc20-create-pool.ts )
- ERC20 Add Liquidity ( ./scripts/erc20-add-liquidity.ts )
- Pancake Swap Snapit/USDC ( ./scripts/erc20-swap-snapit.ts )

Forking is required.

### Bsc Testnet Deployment Notes:

Snapit/USDC Trade Link: https://pancakeswap.finance/swap?chain=bscTestnet&inputCurrency=0x8d809eC21EDDdc73ed8629A4E9B3E73169A20e36&outputCurrency=0x64544969ed7EBf5f083679233325356EbE738930

#### Chain Explorer transaction samples:

- Add Liquidity: https://testnet.bscscan.com/tx/0x9a980f771ecbca9ca30d1c7920230f081ecbb95a6d5f305294b332a7ab73b1a9
- Swap: https://testnet.bscscan.com/tx/0x0d35cbf2975eb27064a4ec03383ca0075412d294cc443061d5be718a4f775449

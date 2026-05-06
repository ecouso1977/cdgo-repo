require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const {
  RPC_URL,
  MAINNET_RPC_URL,
  PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  BASESCAN_API_KEY
} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    mainnet: {
      url: MAINNET_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    baseSepolia: {
      url: RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY || "",
    customChains: []
  }
};
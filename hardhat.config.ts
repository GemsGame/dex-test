const { HardhatUserConfig } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const config = {
  solidity: "0.7.6",
  settings: {
    evmVersion: "istanbul",
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },

  networks: {
    hardhat: {
      forking: {
        url: "https://rpc-mainnet.matic.quiknode.pro",
      },
    },
    polygon: {
      url: "https://rpc-mainnet.matic.quiknode.pro",
      accounts: [process.env.PRIVATE_KEY],
      network_id: 137,
      gasPrice: "auto",
    },
  },
};

module.exports = config;

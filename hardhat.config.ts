import "dotenv/config"
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    amoy: {
      url: "https://polygon-amoy.g.alchemy.com/v2/GvuqyZytAzMqbZiA25cjLvB8WZ9mbru3",
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/PwLFgwHhfPYXl7Zbr5-6lTRciwNkGVpl",
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    }
  }
};

export default config;

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
    },
    mantle: {
      url: "https://rpc.mantle.xyz",
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
    linea: {
      url: `https://linea-mainnet.infura.io/v3/4207fe007a0c4f428558e8680104a75e`,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      mantle: "mantle",
      linea: process.env.LINEASCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "mantle",
        chainId: 5000,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/mainnet/evm/5000/etherscan",
          browserURL: "https://mantlescan.info"
        }
      },
      {
        network: "linea",
        chainId: 59144,
        urls: {
          apiURL: "https://api.lineascan.build/api",
          browserURL: "https://lineascan.build/"
        }
      }
    ]
  },
};

export default config;

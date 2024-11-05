import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import dotenv from 'dotenv';

// Load env
dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/VqPYqljQysaWgSIPG8FV6G1da2SLGts9`,
      accounts: [process.env.ETH_SECRET_KEY as string]
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/VqPYqljQysaWgSIPG8FV6G1da2SLGts9`,
      accounts: [process.env.ETH_SECRET_KEY as string]
    },
  },
};

export default config;

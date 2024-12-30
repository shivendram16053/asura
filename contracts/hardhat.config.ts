import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545", // BSC testnet RPC URL
      accounts: [process.env.PRIVATE_KEY || ""] // Load private key from .env
    },
  },
};

export default config;

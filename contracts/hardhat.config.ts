import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import dotenv from "dotenv";

dotenv.config()

if (!process.env.PRIVATE_KEY) {
  throw new Error("Missing PRIVATE_KEY environment variable");
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    bscTestnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

export default config;

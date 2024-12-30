import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Compile and deploy the contract
  const BattleContract = await ethers.getContractFactory("Asura");
  const battleContract = await BattleContract.deploy();

  console.log("BattleContract deployed to:", battleContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

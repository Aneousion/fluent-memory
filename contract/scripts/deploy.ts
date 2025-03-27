import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Deploying MemoryMatchNFT contract...");
  console.log("Chain ID:", network.chainId);
  console.log("Deployer address:", deployer.address);
  console.log(
    "Deployer balance:",
    ethers.utils.formatEther(await deployer.getBalance()),
    "ETH"
  );

  const MemoryMatchNFT = await ethers.getContractFactory("MemoryMatchNFT");
  const memoryMatchNFT = await MemoryMatchNFT.deploy();
  await memoryMatchNFT.deployed();
  console.log("MemoryMatchNFT deployed to:", memoryMatchNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
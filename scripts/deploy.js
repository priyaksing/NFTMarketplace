const hre = require("hardhat");

// Contract deployed at :  0x043f8927126D494ddAc7fd55162f08c360c02B05

async function main() {

  const [deployer] = await hre.ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);

  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftmarketplace = await NFTMarketplace.deploy();
  await nftmarketplace.waitForDeployment();

  console.log("Contract deployed at : ", await nftmarketplace.getAddress())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

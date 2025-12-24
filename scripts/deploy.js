const hre = require("hardhat");

async function main() {
  const name = "MyToken";
  const symbol = "MTK";
  const initialSupply = hre.ethers.parseEther("1000000"); // 1 million tokens

  console.log("Deploying ERC20Token...");
  console.log(`  Name: ${name}`);
  console.log(`  Symbol: ${symbol}`);
  console.log(`  Initial Supply: ${hre.ethers.formatEther(initialSupply)} tokens`);

  const token = await hre.ethers.deployContract("ERC20Token", [
    name,
    symbol,
    initialSupply,
  ]);

  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log(`ERC20Token deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

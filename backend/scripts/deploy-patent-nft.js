// Script to deploy PatentNFT contract
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying PatentNFT contract...");
  
  // Get the first signer as the default owner
  const [deployer] = await hre.ethers.getSigners();
  
  // Deploy the contract
  const patentNFT = await hre.ethers.deployContract("PatentNFT", [
    "PatentChain Patent NFT",  // name
    "PCPATENT"                 // symbol
  ]);
  
  // Wait for deployment to complete
  await patentNFT.waitForDeployment();
  
  // Get the deployed contract address
  const address = await patentNFT.getAddress();
  
  console.log("PatentNFT deployed to:", address);
  console.log("Transaction hash:", patentNFT.deploymentTransaction().hash);
  
  // Verify deployment - check base URI
  const baseURI = await patentNFT.baseURI?.();
  if (baseURI) {
    console.log("Base URI:", baseURI);
  }
  
  // Save deployment info
  const deploymentInfo = {
    contract: "PatentNFT",
    address: address,
    network: hre.network.name || "localhost",
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  // Ensure artifacts/deployments directory exists
  const deploymentsDir = path.join(__dirname, "..", "artifacts", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save to file
  fs.writeFileSync(
    path.join(deploymentsDir, "patent-nft.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n--- Deployment Info ---");
  console.log(`Contract: PatentNFT`);
  console.log(`Address: ${address}`);
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Deployer: ${deploymentInfo.deployer}`);
  
  // Auto-update frontend .env.local file
  const envPath = path.join(__dirname, "..", "..", "frontend", ".env.local");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    const regex = /NEXT_PUBLIC_PATENT_NFT_CONTRACT_ADDRESS_LOCAL=.*/;
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `NEXT_PUBLIC_PATENT_NFT_CONTRACT_ADDRESS_LOCAL=${address}`);
    } else {
      envContent += `\nNEXT_PUBLIC_PATENT_NFT_CONTRACT_ADDRESS_LOCAL=${address}`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log(`\n✅ Updated frontend/.env.local with new contract address`);
  } else {
    console.log(`\n⚠️  frontend/.env.local not found. Add this manually:`);
    console.log(`NEXT_PUBLIC_PATENT_NFT_CONTRACT_ADDRESS_LOCAL=${address}`);
  }
  
  return { address, contract: patentNFT };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });

module.exports = { main };

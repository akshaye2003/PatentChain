// Script to deploy PatentRegistry contract
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying PatentRegistry contract...");
  
  // Deploy the contract
  const patentRegistry = await hre.ethers.deployContract("PatentRegistry");
  
  // Wait for deployment to complete (Ethers v6 style)
  await patentRegistry.waitForDeployment();
  
  // Get the deployed contract address
  const address = await patentRegistry.getAddress();
  
  console.log("PatentRegistry deployed to:", address);
  console.log("Transaction hash:", patentRegistry.deploymentTransaction().hash);
  
  // Verify deployment by calling a function
  const totalDocs = await patentRegistry.totalDocuments();
  console.log("Initial total documents:", totalDocs.toString());
  
  // Export address for other scripts
  console.log("\n--- Deployment Info ---");
  console.log(`Contract: PatentRegistry`);
  console.log(`Address: ${address}`);
  console.log(`Network: ${hre.network.name || "localhost"}`);
  console.log(`Deployer: ${(await hre.ethers.getSigners())[0].address}`);
  
  // Auto-update frontend .env.local file
  const envPath = path.join(__dirname, "..", "..", "frontend", ".env.local");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    const regex = /NEXT_PUBLIC_CONTRACT_ADDRESS_LOCAL=.*/;
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `NEXT_PUBLIC_CONTRACT_ADDRESS_LOCAL=${address}`);
    } else {
      envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS_LOCAL=${address}`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated frontend/.env.local with new contract address`);
  } else {
    console.log(`⚠️  frontend/.env.local not found. Add this manually:`);
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS_LOCAL=${address}`);
  }
  
  return { address, contract: patentRegistry };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });

module.exports = { main };

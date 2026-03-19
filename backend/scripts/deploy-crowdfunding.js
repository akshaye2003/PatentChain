// Script to deploy Crowdfunding contract
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying Crowdfunding contract...");
  
  // Deploy the contract
  const crowdfunding = await hre.ethers.deployContract("Crowdfunding");
  
  // Wait for deployment to complete
  await crowdfunding.waitForDeployment();
  
  // Get the deployed contract address
  const address = await crowdfunding.getAddress();
  
  console.log("Crowdfunding deployed to:", address);
  console.log("Transaction hash:", crowdfunding.deploymentTransaction().hash);
  
  // Verify deployment
  const projectCount = await crowdfunding.projectCount();
  console.log("Initial project count:", projectCount.toString());
  
  // Save deployment info
  const deploymentInfo = {
    contract: "Crowdfunding",
    address: address,
    network: hre.network.name || "localhost",
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString()
  };
  
  // Ensure artifacts/deployments directory exists
  const deploymentsDir = path.join(__dirname, "..", "artifacts", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save to file
  fs.writeFileSync(
    path.join(deploymentsDir, "crowdfunding.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n--- Deployment Info ---");
  console.log(`Contract: Crowdfunding`);
  console.log(`Address: ${address}`);
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Deployer: ${deploymentInfo.deployer}`);
  
  // Auto-update frontend .env.local file
  const envPath = path.join(__dirname, "..", "..", "frontend", ".env.local");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    const regex = /NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS_LOCAL=.*/;
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS_LOCAL=${address}`);
    } else {
      envContent += `\nNEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS_LOCAL=${address}`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated frontend/.env.local with new contract address`);
  } else {
    console.log(`⚠️  frontend/.env.local not found. Add this manually:`);
    console.log(`NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS_LOCAL=${address}`);
  }
  
  return { address, contract: crowdfunding };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });

module.exports = { main };

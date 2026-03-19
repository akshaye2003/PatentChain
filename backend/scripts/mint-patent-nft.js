#!/usr/bin/env node
// Complete script: Upload PDF to IPFS + Mint NFT
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const FormData = require("form-data");
const { ethers } = require("hardhat");
require("dotenv").config({ path: "../frontend/.env.local" });

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || process.env.PINATA_SECRET_KEY;

// Contract address from .env.local
const PATENT_NFT_ADDRESS = process.env.NEXT_PUBLIC_PATENT_NFT_CONTRACT_ADDRESS_LOCAL;

async function uploadToIPFS(filePath, patentTitle, patentDescription) {
  const fileBuffer = fs.readFileSync(filePath);
  const documentHash = "0x" + crypto.createHash("sha256").update(fileBuffer).digest("hex");

  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath), {
    filename: path.basename(filePath),
    contentType: "application/pdf",
  });

  const metadata = JSON.stringify({
    name: patentTitle,
    keyvalues: {
      description: patentDescription,
      type: "patent",
      documentHash: documentHash,
      uploadedAt: new Date().toISOString(),
    },
  });
  formData.append("pinataMetadata", metadata);

  console.log("⬆️  Uploading to IPFS...");
  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
      ...formData.getHeaders(),
    },
    body: formData,
  });

  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  
  // Upload metadata JSON
  const metadataJSON = {
    name: patentTitle,
    description: patentDescription,
    image: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    external_url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    attributes: [
      { trait_type: "Document Hash", value: documentHash },
      { trait_type: "File Type", value: "PDF" },
    ],
  };

  const metaForm = new FormData();
  metaForm.append("file", Buffer.from(JSON.stringify(metadataJSON)), {
    filename: "metadata.json",
    contentType: "application/json",
  });
  metaForm.append("pinataMetadata", JSON.stringify({ name: `${patentTitle} - Metadata` }));

  const metaResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
      ...metaForm.getHeaders(),
    },
    body: metaForm,
  });

  if (!metaResponse.ok) throw new Error(await metaResponse.text());
  const metaData = await metaResponse.json();

  return {
    documentHash,
    ipfsHash: data.IpfsHash,
    metadataURI: `https://gateway.pinata.cloud/ipfs/${metaData.IpfsHash}`,
  };
}

async function mintPatentNFT(filePath, title, description, transferable = false) {
  // 1. Upload to IPFS
  console.log("\n📄 Step 1: Upload to IPFS\n");
  const uploadResult = await uploadToIPFS(filePath, title, description);
  console.log(`   ✅ IPFS Hash: ${uploadResult.ipfsHash}`);
  console.log(`   ✅ Document Hash: ${uploadResult.documentHash}`);
  console.log(`   ✅ Metadata URI: ${uploadResult.metadataURI}`);

  // 2. Connect to contract
  console.log("\n⛓️  Step 2: Connect to PatentNFT Contract\n");
  
  if (!PATENT_NFT_ADDRESS) {
    console.error("❌ PatentNFT contract address not found!");
    console.log("Deploy the contract first: npm run deploy:patent-nft");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  console.log(`   Wallet: ${signer.address}`);
  console.log(`   Contract: ${PATENT_NFT_ADDRESS}`);

  const PatentNFT = await ethers.getContractFactory("PatentNFT");
  const patentNFT = PatentNFT.attach(PATENT_NFT_ADDRESS).connect(signer);

  // 3. Mint NFT
  console.log("\n🎨 Step 3: Minting Patent NFT\n");
  
  try {
    const tx = await patentNFT.mintPatentNFT(
      signer.address,           // to
      title,                    // title
      description,              // description
      uploadResult.documentHash, // documentHash
      uploadResult.ipfsHash,    // ipfsHash
      uploadResult.metadataURI, // uri
      transferable              // transferable
    );

    console.log(`   Transaction: ${tx.hash}`);
    console.log("   Waiting for confirmation...");

    const receipt = await tx.wait();
    
    // Get token ID from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = patentNFT.interface.parseLog(log);
        return parsed && parsed.name === "PatentMinted";
      } catch { return false; }
    });
    
    let tokenId = null;
    if (event) {
      const parsed = patentNFT.interface.parseLog(event);
      tokenId = parsed.args.tokenId.toString();
    }

    console.log("\n✅ SUCCESS! Patent NFT Minted!\n");
    console.log("   ┌────────────────────────────────────────┐");
    console.log(`   │ Token ID:      ${tokenId || "N/A"}                    │`);
    console.log(`   │ Transaction:   ${tx.hash.substring(0, 30)}... │`);
    console.log(`   │ Block:         ${receipt.blockNumber}                       │`);
    console.log("   └────────────────────────────────────────┘");
    console.log(`\n   📄 PDF: ${uploadResult.pdfURL}`);
    console.log(`   🔗 View on IPFS: https://gateway.pinata.cloud/ipfs/${uploadResult.ipfsHash}`);

    return {
      tokenId,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      ...uploadResult,
    };

  } catch (error) {
    console.error("\n❌ Minting failed:", error.message);
    process.exit(1);
  }
}

// CLI
const filePath = process.argv[2];
const title = process.argv[3] || "Patent Document";
const description = process.argv[4] || "";
const transferable = process.argv[5] === "true";

if (!filePath) {
  console.log("📋 Usage: node scripts/mint-patent-nft.js <pdf-path> [title] [description] [transferable]");
  console.log("\nExample:");
  console.log('  node scripts/mint-patent-nft.js "./my-patent.pdf" "My Invention" "Description" false');
  process.exit(0);
}

mintPatentNFT(filePath, title, description, transferable);

#!/usr/bin/env node
// Script to upload patent PDF to IPFS via Pinata
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const FormData = require("form-data");
require("dotenv").config({ path: "../frontend/.env.local" });

// Pinata API credentials from .env.local
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || process.env.PINATA_SECRET_KEY;

async function uploadToIPFS(filePath, patentTitle, patentDescription) {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.error("❌ Pinata credentials not found!");
    console.log("Add to frontend/.env.local:");
    console.log("NEXT_PUBLIC_PINATA_API_KEY=your_key");
    console.log("NEXT_PUBLIC_PINATA_SECRET_KEY=your_secret");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`\n📄 Uploading: ${path.basename(filePath)}`);
  console.log(`📏 File size: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB\n`);

  // 1. Generate SHA-256 hash of the PDF (for blockchain verification)
  const fileBuffer = fs.readFileSync(filePath);
  const documentHash = "0x" + crypto.createHash("sha256").update(fileBuffer).digest("hex");
  console.log(`🔐 Document Hash (SHA-256): ${documentHash}`);

  // 2. Upload PDF to IPFS via Pinata
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath), {
    filename: path.basename(filePath),
    contentType: "application/pdf",
  });

  // Add metadata for the file
  const metadata = JSON.stringify({
    name: patentTitle || path.basename(filePath),
    keyvalues: {
      description: patentDescription || "Patent document",
      type: "patent",
      documentHash: documentHash,
      uploadedAt: new Date().toISOString(),
    },
  });
  formData.append("pinataMetadata", metadata);

  try {
    console.log("⬆️  Uploading PDF to IPFS via Pinata...");
    
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    
    console.log(`\n✅ PDF uploaded successfully!`);
    console.log(`🔗 IPFS Hash (CID): ${ipfsHash}`);
    console.log(`🌐 PDF URL: https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

    // 3. Create and upload metadata JSON
    const metadataJSON = {
      name: patentTitle || "Patent NFT",
      description: patentDescription || "Patent document tokenized as NFT",
      image: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      external_url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      attributes: [
        { trait_type: "Document Hash", value: documentHash },
        { trait_type: "File Type", value: "PDF" },
        { trait_type: "Upload Date", value: new Date().toISOString() },
      ],
    };

    const metadataBuffer = Buffer.from(JSON.stringify(metadataJSON, null, 2));
    const metaForm = new FormData();
    metaForm.append("file", metadataBuffer, {
      filename: "metadata.json",
      contentType: "application/json",
    });

    const metaMetadata = JSON.stringify({
      name: `${patentTitle || "Patent"} - Metadata`,
      keyvalues: { type: "metadata" },
    });
    metaForm.append("pinataMetadata", metaMetadata);

    console.log("\n⬆️  Uploading metadata to IPFS...");
    
    const metaResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
        ...metaForm.getHeaders(),
      },
      body: metaForm,
    });

    if (!metaResponse.ok) {
      const error = await metaResponse.text();
      throw new Error(error);
    }

    const metaData = await metaResponse.json();
    const metadataHash = metaData.IpfsHash;
    
    console.log(`📝 Metadata IPFS Hash: ${metadataHash}`);
    console.log(`🌐 Metadata URL: https://gateway.pinata.cloud/ipfs/${metadataHash}`);

    // 4. Save results
    const result = {
      documentHash,
      ipfsHash,
      metadataHash,
      metadataURI: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
      pdfURL: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      patentTitle,
      patentDescription,
    };

    // Ensure cache directory exists
    const cacheDir = path.join(__dirname, "..", "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const resultPath = path.join(cacheDir, `upload-result-${Date.now()}.json`);
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

    console.log(`\n📦 Results saved to: ${resultPath}`);
    console.log(`\n✨ Ready to mint NFT! Use these values:`);
    console.log(`   ┌─────────────────────────────────────────────────────┐`);
    console.log(`   │ Document Hash: ${documentHash.substring(0, 50)}... │`);
    console.log(`   │ IPFS Hash:     ${ipfsHash}                  │`);
    console.log(`   │ Metadata URI:  ${result.metadataURI}   │`);
    console.log(`   └─────────────────────────────────────────────────────┘`);

    return result;

  } catch (error) {
    console.error("\n❌ Upload failed:");
    console.error(error.message);
    process.exit(1);
  }
}

// Command line usage
const filePath = process.argv[2];
const title = process.argv[3] || "Patent Document";
const description = process.argv[4] || "";

if (!filePath) {
  console.log("📋 Usage: node scripts/upload-to-ipfs.js <path-to-pdf> [title] [description]");
  console.log("\nExample:");
  console.log('  node scripts/upload-to-ipfs.js "C:/Users/aksha/Documents/my-patent.pdf" "My Invention" "A revolutionary patent"');
  process.exit(0);
}

uploadToIPFS(filePath, title, description);

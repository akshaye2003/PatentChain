// IPFS Upload Utility using Pinata
import crypto from "crypto";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "";
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "";

export interface IPFSUploadResult {
  ipfsHash: string;
  documentHash: string;
  pdfUrl: string;
  metadataUrl: string;
}

/**
 * Generates SHA-256 hash of a file
 */
export function generateDocumentHash(file: File | Buffer): string {
  let buffer: Buffer;
  
  if (file instanceof File) {
    // For browser File objects, we need to read as ArrayBuffer first
    throw new Error("Use generateDocumentHashFromFile for File objects");
  } else {
    buffer = file;
  }
  
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  return "0x" + hash;
}

/**
 * Generates SHA-256 hash from File object (browser)
 */
export async function generateDocumentHashFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  return "0x" + hash;
}

/**
 * Uploads a file to IPFS via Pinata
 */
export async function uploadToIPFS(
  file: File,
  patentTitle: string,
  patentDescription: string
): Promise<IPFSUploadResult> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata credentials not configured. Check your .env.local file.");
  }

  // Generate document hash
  const documentHash = await generateDocumentHashFromFile(file);

  // Create form data for file upload
  const formData = new FormData();
  formData.append("file", file);
  
  // Add metadata
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

  // Upload file to Pinata
  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata upload failed: ${error}`);
  }

  const data = await response.json();
  const ipfsHash = data.IpfsHash;

  // Create and upload metadata JSON
  const metadataJSON = {
    name: patentTitle,
    description: patentDescription,
    image: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    external_url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    attributes: [
      {
        trait_type: "Document Hash",
        value: documentHash,
      },
      {
        trait_type: "File Type",
        value: file.type || "application/pdf",
      },
      {
        trait_type: "Upload Date",
        value: new Date().toISOString(),
      },
    ],
  };

  const metadataBlob = new Blob([JSON.stringify(metadataJSON)], {
    type: "application/json",
  });
  const metadataFile = new File([metadataBlob], "metadata.json");

  const metaFormData = new FormData();
  metaFormData.append("file", metadataFile);
  
  const metaMetadata = JSON.stringify({
    name: `${patentTitle} - Metadata`,
    keyvalues: {
      type: "metadata",
      patentTitle: patentTitle,
    },
  });
  metaFormData.append("pinataMetadata", metaMetadata);

  const metaResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: metaFormData,
  });

  if (!metaResponse.ok) {
    const error = await metaResponse.text();
    throw new Error(`Metadata upload failed: ${error}`);
  }

  const metaData = await metaResponse.json();
  const metadataHash = metaData.IpfsHash;

  return {
    ipfsHash,
    documentHash,
    pdfUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
  };
}

/**
 * Checks if a file is valid for upload
 */
export function validatePatentFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: "Invalid file type. Only PDF, PNG, and JPEG are allowed." 
    };
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: "File too large. Maximum size is 50MB." 
    };
  }

  return { valid: true };
}

import { ethers, BrowserProvider, Contract, JsonRpcSigner, isAddress, getBytes, hexlify, toUtf8Bytes, TransactionResponse, ContractTransactionResponse } from 'ethers';

// ============================================================================
// SUPPORTED NETWORKS
// ============================================================================

export const SUPPORTED_NETWORKS = {
  localhost: {
    chainId: 31337,
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
  },
};

// ============================================================================
// ABI DEFINITIONS
// ============================================================================

export const PATENT_REGISTRY_ABI = [
  {
    inputs: [
      { name: '_hash', type: 'bytes32' },
      { name: '_fileName', type: 'string' },
    ],
    name: 'registerDocument',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_hash', type: 'bytes32' }],
    name: 'isRegistered',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_hash', type: 'bytes32' }],
    name: 'getDocument',
    outputs: [
      {
        components: [
          { name: 'hash', type: 'bytes32' },
          { name: 'fileName', type: 'string' },
          { name: 'owner', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'getOwnerDocuments',
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalDocuments',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'hash', type: 'bytes32' },
      { indexed: false, name: 'fileName', type: 'string' },
      { indexed: false, name: 'owner', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'DocumentRegistered',
    type: 'event',
  },
];

export const CROWDFUNDING_ABI = [
  {
    inputs: [
      { name: '_title', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_category', type: 'string' },
      { name: '_fundingGoal', type: 'uint256' },
      { name: '_duration', type: 'uint256' },
      { name: '_patentHash', type: 'bytes32' },
    ],
    name: 'createProject',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_projectId', type: 'uint256' }],
    name: 'contribute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: '_projectId', type: 'uint256' }],
    name: 'withdrawFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_projectId', type: 'uint256' }],
    name: 'requestRefund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_projectId', type: 'uint256' }],
    name: 'getProject',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'creator', type: 'address' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'fundingGoal', type: 'uint256' },
          { name: 'amountRaised', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'completed', type: 'bool' },
          { name: 'patentHash', type: 'bytes32' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_projectId', type: 'uint256' }],
    name: 'getProjectStatus',
    outputs: [
      {
        components: [
          { name: 'active', type: 'bool' },
          { name: 'funded', type: 'bool' },
          { name: 'completed', type: 'bool' },
          { name: 'exists', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_projectId', type: 'uint256' },
      { name: '_user', type: 'address' },
    ],
    name: 'getUserContribution',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalProjects',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'projectId', type: 'uint256' },
      { indexed: false, name: 'creator', type: 'address' },
      { indexed: false, name: 'title', type: 'string' },
    ],
    name: 'ProjectCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'projectId', type: 'uint256' },
      { indexed: false, name: 'contributor', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'ContributionMade',
    type: 'event',
  },
];

export const PATENT_NFT_ABI = [
  {
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_title', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_documentHash', type: 'bytes32' },
      { name: '_ipfsHash', type: 'string' },
      { name: '_uri', type: 'string' },
      { name: '_transferable', type: 'bool' },
    ],
    name: 'mintPatentNFT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_patentHashes', type: 'bytes32[]' },
      { name: '_ipfsHashes', type: 'string[]' },
      { name: '_titles', type: 'string[]' },
      { name: '_descriptions', type: 'string[]' },
      { name: '_isTransferables', type: 'bool[]' },
      { name: '_recipients', type: 'address[]' },
    ],
    name: 'batchMintPatentNFT',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'patentMetadata',
    outputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'documentHash', type: 'bytes32' },
      { name: 'ipfsHash', type: 'string' },
      { name: 'inventor', type: 'address' },
      { name: 'mintTimestamp', type: 'uint256' },
      { name: 'transferable', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'bytes32' }],
    name: 'hashToTokenId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_documentHash', type: 'bytes32' }],
    name: 'documentHashToTokenId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'getPatentsByOwner',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },

  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: false, name: 'patentHash', type: 'bytes32' },
      { indexed: false, name: 'inventor', type: 'address' },
    ],
    name: 'PatentMinted',
    type: 'event',
  },
];

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PatentDocument {
  hash: string;
  fileName: string;
  owner: string;
  timestamp: bigint;
}

export interface Project {
  id: bigint;
  creator: string;
  title: string;
  description: string;
  category: string;
  fundingGoal: bigint;
  amountRaised: bigint;
  deadline: bigint;
  completed: boolean;
  patentHash: string;
}

export interface ProjectStatus {
  active: boolean;
  funded: boolean;
  completed: boolean;
  exists: boolean;
}

export interface PatentNFT {
  patentHash: string;
  ipfsHash: string;
  title: string;
  description: string;
  isTransferable: boolean;
  mintDate: bigint;
  inventor: string;
}

export type NetworkType = 'localhost' | string;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates if the given string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Gets the PatentRegistry contract address for the specified network
 */
export function getContractAddress(network: NetworkType = 'localhost'): string {
  const envVar = network === 'localhost' 
    ? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCAL 
    : process.env[`NEXT_PUBLIC_CONTRACT_ADDRESS_${network.toUpperCase()}`];
  
  if (!envVar) {
    throw new Error(`PatentRegistry contract address not found for network: ${network}`);
  }
  
  if (!isValidAddress(envVar)) {
    throw new Error(`Invalid PatentRegistry contract address: ${envVar}`);
  }
  
  return envVar;
}

/**
 * Gets the Crowdfunding contract address for the specified network
 */
export function getCrowdfundingContractAddress(network: NetworkType = 'localhost'): string {
  const envVar = network === 'localhost' 
    ? process.env.NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS_LOCAL 
    : process.env[`NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS_${network.toUpperCase()}`];
  
  if (!envVar) {
    throw new Error(`Crowdfunding contract address not found for network: ${network}`);
  }
  
  if (!isValidAddress(envVar)) {
    throw new Error(`Invalid Crowdfunding contract address: ${envVar}`);
  }
  
  return envVar;
}

/**
 * Gets the PatentNFT contract address for the specified network
 */
export function getPatentNFTContractAddress(network: NetworkType = 'localhost'): string {
  const envVar = network === 'localhost' 
    ? process.env.NEXT_PUBLIC_PATENT_NFT_CONTRACT_ADDRESS_LOCAL 
    : process.env[`NEXT_PUBLIC_PATENT_NFT_CONTRACT_ADDRESS_${network.toUpperCase()}`];
  
  if (!envVar) {
    throw new Error(`PatentNFT contract address not found for network: ${network}`);
  }
  
  if (!isValidAddress(envVar)) {
    throw new Error(`Invalid PatentNFT contract address: ${envVar}`);
  }
  
  return envVar;
}

/**
 * Converts a hex string to bytes32 format
 */
export function hexToBytes32(hex: string): string {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  
  // Pad to 64 characters (32 bytes)
  const paddedHex = cleanHex.padStart(64, '0');
  
  return '0x' + paddedHex;
}

/**
 * Checks if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const ethereum = (window as Window & { ethereum?: { isMetaMask?: boolean } }).ethereum;
  return !!(ethereum && ethereum.isMetaMask);
}

/**
 * Connects to MetaMask wallet
 */
export async function connectWallet(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this feature.');
  }
  
  try {
    const ethereum = (window as Window & { ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    
    if (!ethereum?.request) {
      throw new Error('MetaMask request method not available');
    }
    
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    }) as string[];
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.');
    }
    
    return accounts[0];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
    throw new Error('Failed to connect wallet: Unknown error');
  }
}

/**
 * Gets the connected wallet address
 */
export async function getWalletAddress(): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    return null;
  }
  
  try {
    const ethereum = (window as Window & { ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    
    if (!ethereum?.request) {
      return null;
    }
    
    const accounts = await ethereum.request({
      method: 'eth_accounts',
    }) as string[];
    
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting wallet address:', error);
    return null;
  }
}

/**
 * Gets the current network chain ID
 */
export async function getNetworkChainId(): Promise<number | null> {
  if (!isMetaMaskInstalled()) {
    return null;
  }
  
  try {
    const ethereum = (window as Window & { ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    
    if (!ethereum?.request) {
      return null;
    }
    
    const chainIdHex = await ethereum.request({
      method: 'eth_chainId',
    }) as string;
    
    return parseInt(chainIdHex, 16);
  } catch (error) {
    console.error('Error getting network chain ID:', error);
    return null;
  }
}

/**
 * Switches MetaMask to the specified network
 */
export async function switchNetwork(chainId: number): Promise<void> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this feature.');
  }
  
  try {
    const ethereum = (window as Window & { ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    
    if (!ethereum?.request) {
      throw new Error('MetaMask request method not available');
    }
    
    const chainIdHex = '0x' + chainId.toString(16);
    
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (error: unknown) {
    // This error code indicates that the chain has not been added to MetaMask
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 4902) {
      throw new Error(`Network with chain ID ${chainId} is not added to MetaMask. Please add it manually.`);
    }
    
    if (error instanceof Error) {
      throw new Error(`Failed to switch network: ${error.message}`);
    }
    
    throw new Error('Failed to switch network: Unknown error');
  }
}

// ============================================================================
// PROVIDER & CONTRACT HELPERS
// ============================================================================

/**
 * Gets the browser provider from MetaMask
 */
async function getProvider(): Promise<BrowserProvider> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this feature.');
  }
  
  const ethereum = (window as Window & { ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>; on?: (event: string, callback: (params: unknown) => void) => void } }).ethereum;
  
  if (!ethereum) {
    throw new Error('Ethereum provider not available');
  }
  
  return new BrowserProvider(ethereum as ethers.Eip1193Provider);
}

/**
 * Gets a signer from the provider
 */
async function getSigner(): Promise<JsonRpcSigner> {
  const provider = await getProvider();
  return provider.getSigner();
}

/**
 * Gets a read-only provider (for view functions)
 */
async function getReadOnlyProvider(): Promise<BrowserProvider> {
  return getProvider();
}

// ============================================================================
// PATENT REGISTRY FUNCTIONS
// ============================================================================

/**
 * Registers a document on the PatentRegistry contract
 */
export async function registerDocument(
  documentHash: string,
  fileName: string,
  contractAddress: string,
  network: NetworkType = 'localhost'
): Promise<string> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    if (!documentHash) {
      throw new Error('Document hash is required');
    }
    
    if (!fileName || fileName.trim() === '') {
      throw new Error('File name is required');
    }
    
    const signer = await getSigner();
    const contract = new Contract(contractAddress, PATENT_REGISTRY_ABI, signer);
    
    const bytes32Hash = hexToBytes32(documentHash);
    
    const tx = await contract.registerDocument(bytes32Hash, fileName) as ContractTransactionResponse;
    const receipt = await tx.wait();
    
    if (!receipt || receipt.status !== 1) {
      throw new Error('Transaction failed');
    }
    
    return tx.hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to register document: ${error.message}`);
    }
    throw new Error('Failed to register document: Unknown error');
  }
}

/**
 * Checks if a document is registered
 */
export async function checkDocumentRegistered(
  documentHash: string,
  contractAddress: string
): Promise<boolean> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    if (!documentHash) {
      throw new Error('Document hash is required');
    }
    
    const provider = await getReadOnlyProvider();
    const contract = new Contract(contractAddress, PATENT_REGISTRY_ABI, provider);
    
    const bytes32Hash = hexToBytes32(documentHash);
    
    const isRegistered = await contract.isRegistered(bytes32Hash) as boolean;
    
    return isRegistered;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to check document registration: ${error.message}`);
    }
    throw new Error('Failed to check document registration: Unknown error');
  }
}

/**
 * Gets document information from the registry
 */
export async function getDocumentInfo(
  documentHash: string,
  contractAddress: string
): Promise<PatentDocument> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    if (!documentHash) {
      throw new Error('Document hash is required');
    }
    
    const provider = await getReadOnlyProvider();
    const contract = new Contract(contractAddress, PATENT_REGISTRY_ABI, provider);
    
    const bytes32Hash = hexToBytes32(documentHash);
    
    const doc = await contract.getDocument(bytes32Hash) as [string, string, string, bigint];
    
    return {
      hash: doc[0],
      fileName: doc[1],
      owner: doc[2],
      timestamp: doc[3],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get document info: ${error.message}`);
    }
    throw new Error('Failed to get document info: Unknown error');
  }
}

/**
 * Gets the document hash from a transaction receipt
 */
export async function getDocumentHashFromTransaction(
  txHash: string,
  contractAddress: string
): Promise<string | null> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    if (!txHash || !txHash.startsWith('0x')) {
      throw new Error('Invalid transaction hash');
    }
    
    const provider = await getReadOnlyProvider();
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }
    
    const contract = new Contract(contractAddress, PATENT_REGISTRY_ABI, provider);
    const iface = contract.interface;
    
    for (const log of receipt.logs) {
      try {
        const parsedLog = iface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        
        if (parsedLog && parsedLog.name === 'DocumentRegistered') {
          return parsedLog.args.hash as string;
        }
      } catch {
        // Skip logs that don't match
        continue;
      }
    }
    
    return null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get document hash from transaction: ${error.message}`);
    }
    throw new Error('Failed to get document hash from transaction: Unknown error');
  }
}

// ============================================================================
// CROWDFUNDING FUNCTIONS
// ============================================================================

/**
 * Creates a new crowdfunding project
 */
export async function createProject(
  title: string,
  description: string,
  category: string,
  fundingGoal: string | bigint,
  duration: number,
  patentHash: string,
  contractAddress: string
): Promise<string> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    if (!title || title.trim() === '') {
      throw new Error('Title is required');
    }
    
    if (!description || description.trim() === '') {
      throw new Error('Description is required');
    }
    
    if (!category || category.trim() === '') {
      throw new Error('Category is required');
    }
    
    if (!fundingGoal || fundingGoal.toString() === '0') {
      throw new Error('Funding goal must be greater than 0');
    }
    
    if (duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }
    
    const signer = await getSigner();
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, signer);
    
    const bytes32Hash = hexToBytes32(patentHash);
    const fundingGoalWei = typeof fundingGoal === 'string' ? ethers.parseEther(fundingGoal) : fundingGoal;
    
    const tx = await contract.createProject(
      title,
      description,
      category,
      fundingGoalWei,
      duration,
      bytes32Hash
    ) as ContractTransactionResponse;
    
    const receipt = await tx.wait();
    
    if (!receipt || receipt.status !== 1) {
      throw new Error('Transaction failed');
    }
    
    return tx.hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
    throw new Error('Failed to create project: Unknown error');
  }
}

/**
 * Contributes to a crowdfunding project
 */
export async function contributeToProject(
  projectId: number | bigint,
  amount: string | bigint,
  contractAddress: string
): Promise<string> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    if (projectId < 0) {
      throw new Error('Invalid project ID');
    }
    
    if (!amount || amount.toString() === '0') {
      throw new Error('Contribution amount must be greater than 0');
    }
    
    const signer = await getSigner();
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, signer);
    
    const amountWei = typeof amount === 'string' ? ethers.parseEther(amount) : amount;
    
    const tx = await contract.contribute(projectId, { value: amountWei }) as ContractTransactionResponse;
    const receipt = await tx.wait();
    
    if (!receipt || receipt.status !== 1) {
      throw new Error('Transaction failed');
    }
    
    return tx.hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to contribute to project: ${error.message}`);
    }
    throw new Error('Failed to contribute to project: Unknown error');
  }
}

/**
 * Gets project information
 */
export async function getProject(
  projectId: number | bigint,
  contractAddress: string
): Promise<Project> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    const provider = await getReadOnlyProvider();
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, provider);
    
    const project = await contract.getProject(projectId) as [bigint, string, string, string, string, bigint, bigint, bigint, boolean, string];
    
    return {
      id: project[0],
      creator: project[1],
      title: project[2],
      description: project[3],
      category: project[4],
      fundingGoal: project[5],
      amountRaised: project[6],
      deadline: project[7],
      completed: project[8],
      patentHash: project[9],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get project: ${error.message}`);
    }
    throw new Error('Failed to get project: Unknown error');
  }
}

/**
 * Gets project status
 */
export async function getProjectStatus(
  projectId: number | bigint,
  contractAddress: string
): Promise<ProjectStatus> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    const provider = await getReadOnlyProvider();
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, provider);
    
    const status = await contract.getProjectStatus(projectId) as [boolean, boolean, boolean, boolean];
    
    return {
      active: status[0],
      funded: status[1],
      completed: status[2],
      exists: status[3],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get project status: ${error.message}`);
    }
    throw new Error('Failed to get project status: Unknown error');
  }
}

/**
 * Gets user contribution for a project
 */
export async function getUserContribution(
  projectId: number | bigint,
  userAddress: string,
  contractAddress: string
): Promise<bigint> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    if (!isValidAddress(userAddress)) {
      throw new Error(`Invalid user address: ${userAddress}`);
    }
    
    const provider = await getReadOnlyProvider();
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, provider);
    
    const contribution = await contract.getUserContribution(projectId, userAddress) as bigint;
    
    return contribution;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get user contribution: ${error.message}`);
    }
    throw new Error('Failed to get user contribution: Unknown error');
  }
}

/**
 * Withdraws funds from a completed project
 */
export async function withdrawFunds(
  projectId: number | bigint,
  contractAddress: string
): Promise<string> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    const signer = await getSigner();
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, signer);
    
    const tx = await contract.withdrawFunds(projectId) as ContractTransactionResponse;
    const receipt = await tx.wait();
    
    if (!receipt || receipt.status !== 1) {
      throw new Error('Transaction failed');
    }
    
    return tx.hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to withdraw funds: ${error.message}`);
    }
    throw new Error('Failed to withdraw funds: Unknown error');
  }
}

/**
 * Requests a refund for a failed project
 */
export async function requestRefund(
  projectId: number | bigint,
  contractAddress: string
): Promise<string> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    const signer = await getSigner();
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, signer);
    
    const tx = await contract.requestRefund(projectId) as ContractTransactionResponse;
    const receipt = await tx.wait();
    
    if (!receipt || receipt.status !== 1) {
      throw new Error('Transaction failed');
    }
    
    return tx.hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to request refund: ${error.message}`);
    }
    throw new Error('Failed to request refund: Unknown error');
  }
}

/**
 * Gets the total number of projects
 */
export async function getTotalProjects(contractAddress: string): Promise<bigint> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    const provider = await getReadOnlyProvider();
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, provider);
    
    const total = await contract.totalProjects() as bigint;
    
    return total;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get total projects: ${error.message}`);
    }
    throw new Error('Failed to get total projects: Unknown error');
  }
}

// ============================================================================
// PATENT NFT FUNCTIONS
// ============================================================================

/**
 * Mints a new Patent NFT
 */
export async function mintPatentNFT(
  documentHash: string,
  ipfsHash: string,
  title: string,
  description: string,
  isTransferable: boolean,
  recipient: string,
  contractAddress: string
): Promise<string> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    if (!isValidAddress(recipient)) {
      throw new Error(`Invalid recipient address: ${recipient}`);
    }
    
    if (!documentHash) {
      throw new Error('Document hash is required');
    }
    
    if (!ipfsHash) {
      throw new Error('IPFS hash is required');
    }
    
    if (!title || title.trim() === '') {
      throw new Error('Title is required');
    }
    
    const signer = await getSigner();
    const contract = new Contract(contractAddress, PATENT_NFT_ABI, signer);
    
    const bytes32Hash = hexToBytes32(documentHash);
    
    // Generate token URI (can be improved to use IPFS metadata JSON)
    const tokenURI = `ipfs://${ipfsHash}`;
    
    const tx = await contract.mintPatentNFT(
      recipient,
      title,
      description,
      bytes32Hash,
      ipfsHash,
      tokenURI,
      isTransferable
    ) as ContractTransactionResponse;
    
    const receipt = await tx.wait();
    
    if (!receipt || receipt.status !== 1) {
      throw new Error('Transaction failed');
    }
    
    return tx.hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to mint Patent NFT: ${error.message}`);
    }
    throw new Error('Failed to mint Patent NFT: Unknown error');
  }
}

/**
 * Gets Patent NFT information
 */
export async function getPatentNFT(
  tokenId: number | bigint,
  contractAddress: string
): Promise<PatentNFT> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    const provider = await getReadOnlyProvider();
    const contract = new Contract(contractAddress, PATENT_NFT_ABI, provider);
    
    const patent = await contract.patentMetadata(tokenId) as [string, string, string, string, string, bigint, boolean];
    
    return {
      title: patent[0],
      description: patent[1],
      patentHash: patent[2],
      ipfsHash: patent[3],
      inventor: patent[4],
      mintDate: patent[5],
      isTransferable: patent[6],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get Patent NFT: ${error.message}`);
    }
    throw new Error('Failed to get Patent NFT: Unknown error');
  }
}

/**
 * Checks if a patent is already minted
 */
export async function isPatentMinted(
  documentHash: string,
  contractAddress: string
): Promise<boolean> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    if (!documentHash) {
      throw new Error('Document hash is required');
    }
    
    const provider = await getReadOnlyProvider();
    const contract = new Contract(contractAddress, PATENT_NFT_ABI, provider);
    
    const bytes32Hash = hexToBytes32(documentHash);
    
    const tokenId = await contract.documentHashToTokenId(bytes32Hash) as bigint;
    
    return tokenId !== BigInt(0);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to check if patent is minted: ${error.message}`);
    }
    throw new Error('Failed to check if patent is minted: Unknown error');
  }
}

/**
 * Gets all patents owned by an address
 */
export async function getPatentsByOwner(
  owner: string,
  contractAddress: string
): Promise<bigint[]> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }
    
    if (!isValidAddress(owner)) {
      throw new Error(`Invalid owner address: ${owner}`);
    }
    
    const provider = await getReadOnlyProvider();
    const contract = new Contract(contractAddress, PATENT_NFT_ABI, provider);
    
    const tokenIds = await contract.getPatentsByOwner(owner) as bigint[];
    
    return tokenIds;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get patents by owner: ${error.message}`);
    }
    throw new Error('Failed to get patents by owner: Unknown error');
  }
}

/**
 * Gets the current mint fee
 */
export async function getMintFee(contractAddress: string): Promise<bigint> {
  // This contract doesn't have a mint fee - minting is free
  return BigInt(0);
}

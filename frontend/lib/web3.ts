import { BrowserProvider, Contract, ContractTransactionResponse, ethers, isAddress, JsonRpcSigner } from "ethers"

export const SUPPORTED_NETWORKS = {
  localhost: {
    chainId: 31337,
    name: "Hardhat Local",
    rpcUrl: "http://127.0.0.1:8545",
  },
} as const

export const PATENT_REGISTRY_ABI = [
  {
    inputs: [
      { name: "_hash", type: "bytes32" },
      { name: "_fileName", type: "string" },
    ],
    name: "registerDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_hash", type: "bytes32" }],
    name: "isRegistered",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_hash", type: "bytes32" }],
    name: "getDocument",
    outputs: [
      {
        components: [
          { name: "hash", type: "bytes32" },
          { name: "fileName", type: "string" },
          { name: "owner", type: "address" },
          { name: "timestamp", type: "uint256" },
          { name: "blockNumber", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_owner", type: "address" }],
    name: "getOwnerDocuments",
    outputs: [{ name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalDocuments",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "hash", type: "bytes32" },
      { indexed: false, name: "fileName", type: "string" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "timestamp", type: "uint256" },
      { indexed: false, name: "blockNumber", type: "uint256" },
    ],
    name: "DocumentRegistered",
    type: "event",
  },
] as const

export const CROWDFUNDING_ABI = [
  {
    inputs: [
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
      { name: "_category", type: "string" },
      { name: "_fundingGoal", type: "uint256" },
      { name: "_duration", type: "uint256" },
      { name: "_patentHash", type: "bytes32" },
    ],
    name: "createProject",
    outputs: [{ name: "projectId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_projectId", type: "uint256" }],
    name: "contribute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "_projectId", type: "uint256" }],
    name: "withdrawFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_projectId", type: "uint256" }],
    name: "requestRefund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_projectId", type: "uint256" }],
    name: "finalizeProject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_projectId", type: "uint256" }],
    name: "getProject",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "category", type: "string" },
          { name: "fundingGoal", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "amountRaised", type: "uint256" },
          { name: "patentHash", type: "bytes32" },
          { name: "status", type: "uint8" },
          { name: "fundsWithdrawn", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_projectId", type: "uint256" }],
    name: "getProjectContributors",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_projectId", type: "uint256" },
      { name: "_contributor", type: "address" },
    ],
    name: "getContribution",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_projectId", type: "uint256" }],
    name: "hasEnded",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "projectCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "projectId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "title", type: "string" },
      { indexed: false, name: "fundingGoal", type: "uint256" },
      { indexed: false, name: "deadline", type: "uint256" },
      { indexed: false, name: "patentHash", type: "bytes32" },
    ],
    name: "ProjectCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "projectId", type: "uint256" },
      { indexed: true, name: "contributor", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "ContributionReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "projectId", type: "uint256" },
      { indexed: false, name: "status", type: "uint8" },
    ],
    name: "ProjectStatusUpdated",
    type: "event",
  },
] as const

export const PATENT_NFT_ABI = [
  {
    inputs: [
      { name: "_to", type: "address" },
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
      { name: "_documentHash", type: "bytes32" },
      { name: "_ipfsHash", type: "string" },
      { name: "_uri", type: "string" },
      { name: "_transferable", type: "bool" },
    ],
    name: "mintPatentNFT",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_to", type: "address" },
      { name: "_titles", type: "string[]" },
      { name: "_descriptions", type: "string[]" },
      { name: "_documentHashes", type: "bytes32[]" },
      { name: "_ipfsHashes", type: "string[]" },
      { name: "_uris", type: "string[]" },
      { name: "_transferable", type: "bool" },
    ],
    name: "batchMintPatentNFT",
    outputs: [{ name: "tokenIds", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "patentMetadata",
    outputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "documentHash", type: "bytes32" },
      { name: "ipfsHash", type: "string" },
      { name: "inventor", type: "address" },
      { name: "mintTimestamp", type: "uint256" },
      { name: "transferable", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_documentHash", type: "bytes32" }],
    name: "documentHashToTokenId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_owner", type: "address" }],
    name: "getPatentsByOwner",
    outputs: [{ name: "tokenIds", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_documentHash", type: "bytes32" }],
    name: "isMinted",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_documentHash", type: "bytes32" }],
    name: "getTokenIdByDocumentHash",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_tokenId", type: "uint256" }],
    name: "getPatentMetadata",
    outputs: [
      {
        components: [
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "documentHash", type: "bytes32" },
          { name: "ipfsHash", type: "string" },
          { name: "inventor", type: "address" },
          { name: "mintTimestamp", type: "uint256" },
          { name: "transferable", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "inventor", type: "address" },
      { indexed: true, name: "documentHash", type: "bytes32" },
      { indexed: false, name: "ipfsHash", type: "string" },
      { indexed: false, name: "title", type: "string" },
    ],
    name: "PatentMinted",
    type: "event",
  },
] as const

export interface PatentDocument {
  hash: string
  fileName: string
  owner: string
  timestamp: bigint
  blockNumber: bigint
}

export type ProjectState = "Active" | "Successful" | "Failed"

export interface Project {
  id: bigint
  creator: string
  title: string
  description: string
  category: string
  fundingGoal: bigint
  deadline: bigint
  amountRaised: bigint
  patentHash: string
  status: ProjectState
  fundsWithdrawn: boolean
}

export interface ProjectStatus {
  active: boolean
  funded: boolean
  completed: boolean
  exists: boolean
}

export interface PatentNFT {
  title: string
  description: string
  patentHash: string
  ipfsHash: string
  inventor: string
  mintDate: bigint
  isTransferable: boolean
  tokenURI?: string
}

export interface TransactionResult {
  txHash: string
  blockNumber: number
}

export interface DocumentRegistrationResult extends TransactionResult {
  documentHash: string
}

export interface ProjectCreationResult extends TransactionResult {
  projectId: bigint | null
}

export type NetworkType = "localhost" | string

function getProjectState(status: number | bigint): ProjectState {
  const numericStatus = Number(status)
  if (numericStatus === 1) return "Successful"
  if (numericStatus === 2) return "Failed"
  return "Active"
}

export function isValidAddress(address: string): boolean {
  return isAddress(address)
}

export function getContractAddress(network: NetworkType = "localhost"): string {
  const envVar =
    network === "localhost"
      ? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCAL
      : process.env[`NEXT_PUBLIC_CONTRACT_ADDRESS_${network.toUpperCase()}`]

  if (!envVar) {
    throw new Error(`PatentRegistry contract address not found for network: ${network}`)
  }

  if (!isValidAddress(envVar)) {
    throw new Error(`Invalid PatentRegistry contract address: ${envVar}`)
  }

  return envVar
}

export function getCrowdfundingContractAddress(network: NetworkType = "localhost"): string {
  const envVar =
    network === "localhost"
      ? process.env.NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS_LOCAL
      : process.env[`NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS_${network.toUpperCase()}`]

  if (!envVar) {
    throw new Error(`Crowdfunding contract address not found for network: ${network}`)
  }

  if (!isValidAddress(envVar)) {
    throw new Error(`Invalid Crowdfunding contract address: ${envVar}`)
  }

  return envVar
}

export function getPatentNFTContractAddress(network: NetworkType = "localhost"): string {
  const envVar =
    network === "localhost"
      ? process.env.NEXT_PUBLIC_PATENT_NFT_CONTRACT_ADDRESS_LOCAL
      : process.env[`NEXT_PUBLIC_PATENT_NFT_CONTRACT_ADDRESS_${network.toUpperCase()}`]

  if (!envVar) {
    throw new Error(`PatentNFT contract address not found for network: ${network}`)
  }

  if (!isValidAddress(envVar)) {
    throw new Error(`Invalid PatentNFT contract address: ${envVar}`)
  }

  return envVar
}

export function hexToBytes32(hex: string): string {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex
  const paddedHex = cleanHex.padStart(64, "0")
  return `0x${paddedHex}`
}

export function isMetaMaskInstalled(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  const ethereum = (window as Window & { ethereum?: { isMetaMask?: boolean } }).ethereum
  return !!(ethereum && ethereum.isMetaMask)
}

export async function connectWallet(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to use this feature.")
  }

  const ethereum = (window as Window & {
    ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
  }).ethereum

  if (!ethereum?.request) {
    throw new Error("MetaMask request method not available")
  }

  const accounts = (await ethereum.request({
    method: "eth_requestAccounts",
  })) as string[]

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found. Please unlock MetaMask.")
  }

  return accounts[0]
}

export async function getWalletAddress(): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    return null
  }

  try {
    const ethereum = (window as Window & {
      ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
    }).ethereum

    if (!ethereum?.request) {
      return null
    }

    const accounts = (await ethereum.request({
      method: "eth_accounts",
    })) as string[]

    return accounts.length > 0 ? accounts[0] : null
  } catch (error) {
    console.error("Error getting wallet address:", error)
    return null
  }
}

export async function getNetworkChainId(): Promise<number | null> {
  if (!isMetaMaskInstalled()) {
    return null
  }

  try {
    const ethereum = (window as Window & {
      ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
    }).ethereum

    if (!ethereum?.request) {
      return null
    }

    const chainIdHex = (await ethereum.request({
      method: "eth_chainId",
    })) as string

    return parseInt(chainIdHex, 16)
  } catch (error) {
    console.error("Error getting network chain ID:", error)
    return null
  }
}

export async function switchNetwork(chainId: number): Promise<void> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to use this feature.")
  }

  try {
    const ethereum = (window as Window & {
      ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
    }).ethereum

    if (!ethereum?.request) {
      throw new Error("MetaMask request method not available")
    }

    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    })
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: number }).code === 4902) {
      throw new Error(`Network with chain ID ${chainId} is not added to MetaMask. Please add it manually.`)
    }

    if (error instanceof Error) {
      throw new Error(`Failed to switch network: ${error.message}`)
    }

    throw new Error("Failed to switch network: Unknown error")
  }
}

async function getProvider(): Promise<BrowserProvider> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to use this feature.")
  }

  const ethereum = (window as Window & { ethereum?: ethers.Eip1193Provider }).ethereum
  if (!ethereum) {
    throw new Error("Ethereum provider not available")
  }

  return new BrowserProvider(ethereum)
}

async function getSigner(): Promise<JsonRpcSigner> {
  const provider = await getProvider()
  return provider.getSigner()
}

async function getReadOnlyProvider(): Promise<BrowserProvider> {
  return getProvider()
}

export async function registerDocument(
  documentHash: string,
  fileName: string,
  contractAddress: string
): Promise<DocumentRegistrationResult> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    if (!documentHash) {
      throw new Error("Document hash is required")
    }

    if (!fileName.trim()) {
      throw new Error("File name is required")
    }

    const signer = await getSigner()
    const contract = new Contract(contractAddress, PATENT_REGISTRY_ABI, signer)
    const bytes32Hash = hexToBytes32(documentHash)
    const tx = (await contract.registerDocument(bytes32Hash, fileName)) as ContractTransactionResponse
    const receipt = await tx.wait()

    if (!receipt || receipt.status !== 1) {
      throw new Error("Transaction failed")
    }

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      documentHash: bytes32Hash,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to register document: ${error.message}`)
    }
    throw new Error("Failed to register document: Unknown error")
  }
}

export async function checkDocumentRegistered(documentHash: string, contractAddress: string): Promise<boolean> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    if (!documentHash) {
      throw new Error("Document hash is required")
    }

    const provider = await getReadOnlyProvider()
    const contract = new Contract(contractAddress, PATENT_REGISTRY_ABI, provider)
    return (await contract.isRegistered(hexToBytes32(documentHash))) as boolean
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to check document registration: ${error.message}`)
    }
    throw new Error("Failed to check document registration: Unknown error")
  }
}

export async function getDocumentInfo(documentHash: string, contractAddress: string): Promise<PatentDocument> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    if (!documentHash) {
      throw new Error("Document hash is required")
    }

    const provider = await getReadOnlyProvider()
    const contract = new Contract(contractAddress, PATENT_REGISTRY_ABI, provider)
    const doc = (await contract.getDocument(hexToBytes32(documentHash))) as [string, string, string, bigint, bigint]

    return {
      hash: doc[0],
      fileName: doc[1],
      owner: doc[2],
      timestamp: doc[3],
      blockNumber: doc[4],
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get document info: ${error.message}`)
    }
    throw new Error("Failed to get document info: Unknown error")
  }
}

export async function getDocumentHashFromTransaction(txHash: string, contractAddress: string): Promise<string | null> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    if (!txHash.startsWith("0x")) {
      throw new Error("Invalid transaction hash")
    }

    const provider = await getReadOnlyProvider()
    const receipt = await provider.getTransactionReceipt(txHash)

    if (!receipt) {
      throw new Error("Transaction receipt not found")
    }

    const contract = new Contract(contractAddress, PATENT_REGISTRY_ABI, provider)

    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        })

        if (parsedLog?.name === "DocumentRegistered") {
          return parsedLog.args.hash as string
        }
      } catch {
        continue
      }
    }

    return null
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get document hash from transaction: ${error.message}`)
    }
    throw new Error("Failed to get document hash from transaction: Unknown error")
  }
}

export async function getTotalDocuments(contractAddress: string): Promise<bigint> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    const provider = await getReadOnlyProvider()
    const contract = new Contract(contractAddress, PATENT_REGISTRY_ABI, provider)
    return (await contract.totalDocuments()) as bigint
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get total documents: ${error.message}`)
    }
    throw new Error("Failed to get total documents: Unknown error")
  }
}

export async function createProject(
  title: string,
  description: string,
  category: string,
  fundingGoal: string | bigint,
  duration: number,
  patentHash: string,
  contractAddress: string
): Promise<ProjectCreationResult> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    if (!title.trim()) {
      throw new Error("Title is required")
    }

    if (!description.trim()) {
      throw new Error("Description is required")
    }

    if (!category.trim()) {
      throw new Error("Category is required")
    }

    if (!fundingGoal || fundingGoal.toString() === "0") {
      throw new Error("Funding goal must be greater than 0")
    }

    if (duration <= 0) {
      throw new Error("Duration must be greater than 0")
    }

    const signer = await getSigner()
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, signer)
    const fundingGoalWei = typeof fundingGoal === "string" ? ethers.parseEther(fundingGoal) : fundingGoal

    const tx = (await contract.createProject(
      title,
      description,
      category,
      fundingGoalWei,
      duration,
      hexToBytes32(patentHash)
    )) as ContractTransactionResponse

    const receipt = await tx.wait()
    if (!receipt || receipt.status !== 1) {
      throw new Error("Transaction failed")
    }

    let projectId: bigint | null = null
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog({ topics: log.topics, data: log.data })
        if (parsedLog?.name === "ProjectCreated") {
          projectId = parsedLog.args.projectId as bigint
          break
        }
      } catch {
        continue
      }
    }

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      projectId,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }
    throw new Error("Failed to create project: Unknown error")
  }
}

export async function contributeToProject(
  projectId: number | bigint,
  amount: string | bigint,
  contractAddress: string
): Promise<TransactionResult> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    if (Number(projectId) < 0) {
      throw new Error("Invalid project ID")
    }

    if (!amount || amount.toString() === "0") {
      throw new Error("Contribution amount must be greater than 0")
    }

    const signer = await getSigner()
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, signer)
    const amountWei = typeof amount === "string" ? ethers.parseEther(amount) : amount
    const tx = (await contract.contribute(projectId, { value: amountWei })) as ContractTransactionResponse
    const receipt = await tx.wait()

    if (!receipt || receipt.status !== 1) {
      throw new Error("Transaction failed")
    }

    return { txHash: tx.hash, blockNumber: receipt.blockNumber }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to contribute to project: ${error.message}`)
    }
    throw new Error("Failed to contribute to project: Unknown error")
  }
}

export async function getProject(projectId: number | bigint, contractAddress: string): Promise<Project> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    const provider = await getReadOnlyProvider()
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, provider)
    const project = (await contract.getProject(projectId)) as [
      bigint,
      string,
      string,
      string,
      string,
      bigint,
      bigint,
      bigint,
      string,
      number,
      boolean,
    ]

    return {
      id: project[0],
      creator: project[1],
      title: project[2],
      description: project[3],
      category: project[4],
      fundingGoal: project[5],
      deadline: project[6],
      amountRaised: project[7],
      patentHash: project[8],
      status: getProjectState(project[9]),
      fundsWithdrawn: project[10],
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get project: ${error.message}`)
    }
    throw new Error("Failed to get project: Unknown error")
  }
}

export async function getProjectStatus(projectId: number | bigint, contractAddress: string): Promise<ProjectStatus> {
  const project = await getProject(projectId, contractAddress)
  const ended = await hasProjectEnded(projectId, contractAddress)

  return {
    active: project.status === "Active" && !ended,
    funded: project.amountRaised >= project.fundingGoal,
    completed: project.status !== "Active",
    exists: project.id > 0n,
  }
}

export async function getUserContribution(
  projectId: number | bigint,
  userAddress: string,
  contractAddress: string
): Promise<bigint> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    if (!isValidAddress(userAddress)) {
      throw new Error(`Invalid user address: ${userAddress}`)
    }

    const provider = await getReadOnlyProvider()
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, provider)
    return (await contract.getContribution(projectId, userAddress)) as bigint
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get user contribution: ${error.message}`)
    }
    throw new Error("Failed to get user contribution: Unknown error")
  }
}

export async function hasProjectEnded(projectId: number | bigint, contractAddress: string): Promise<boolean> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    const provider = await getReadOnlyProvider()
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, provider)
    return (await contract.hasEnded(projectId)) as boolean
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to check project end state: ${error.message}`)
    }
    throw new Error("Failed to check project end state: Unknown error")
  }
}

export async function withdrawFunds(projectId: number | bigint, contractAddress: string): Promise<TransactionResult> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    const signer = await getSigner()
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, signer)
    const tx = (await contract.withdrawFunds(projectId)) as ContractTransactionResponse
    const receipt = await tx.wait()

    if (!receipt || receipt.status !== 1) {
      throw new Error("Transaction failed")
    }

    return { txHash: tx.hash, blockNumber: receipt.blockNumber }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to withdraw funds: ${error.message}`)
    }
    throw new Error("Failed to withdraw funds: Unknown error")
  }
}

export async function requestRefund(projectId: number | bigint, contractAddress: string): Promise<TransactionResult> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    const signer = await getSigner()
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, signer)
    const tx = (await contract.requestRefund(projectId)) as ContractTransactionResponse
    const receipt = await tx.wait()

    if (!receipt || receipt.status !== 1) {
      throw new Error("Transaction failed")
    }

    return { txHash: tx.hash, blockNumber: receipt.blockNumber }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to request refund: ${error.message}`)
    }
    throw new Error("Failed to request refund: Unknown error")
  }
}

export async function getTotalProjects(contractAddress: string): Promise<bigint> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    const provider = await getReadOnlyProvider()
    const contract = new Contract(contractAddress, CROWDFUNDING_ABI, provider)
    return (await contract.projectCount()) as bigint
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get total projects: ${error.message}`)
    }
    throw new Error("Failed to get total projects: Unknown error")
  }
}

export async function mintPatentNFT(
  documentHash: string,
  ipfsHash: string,
  title: string,
  description: string,
  isTransferable: boolean,
  recipient: string,
  contractAddress: string
): Promise<TransactionResult> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    if (!isValidAddress(recipient)) {
      throw new Error(`Invalid recipient address: ${recipient}`)
    }

    if (!documentHash) {
      throw new Error("Document hash is required")
    }

    if (!ipfsHash) {
      throw new Error("IPFS hash is required")
    }

    if (!title.trim()) {
      throw new Error("Title is required")
    }

    const signer = await getSigner()
    const contract = new Contract(contractAddress, PATENT_NFT_ABI, signer)
    const tx = (await contract.mintPatentNFT(
      recipient,
      title,
      description,
      hexToBytes32(documentHash),
      ipfsHash,
      `ipfs://${ipfsHash}`,
      isTransferable
    )) as ContractTransactionResponse

    const receipt = await tx.wait()
    if (!receipt || receipt.status !== 1) {
      throw new Error("Transaction failed")
    }

    return { txHash: tx.hash, blockNumber: receipt.blockNumber }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to mint Patent NFT: ${error.message}`)
    }
    throw new Error("Failed to mint Patent NFT: Unknown error")
  }
}

export async function getPatentNFT(tokenId: number | bigint, contractAddress: string): Promise<PatentNFT | null> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    const provider = await getReadOnlyProvider()
    const contract = new Contract(contractAddress, PATENT_NFT_ABI, provider)
    
    // Check if token exists first
    try {
      await contract.ownerOf(tokenId)
    } catch {
      // Token doesn't exist
      return null
    }
    
    const patent = (await contract.getPatentMetadata(tokenId)) as [string, string, string, string, string, bigint, boolean]
    const tokenURI = (await contract.tokenURI(tokenId)) as string

    return {
      title: patent[0],
      description: patent[1],
      patentHash: patent[2],
      ipfsHash: patent[3],
      inventor: patent[4],
      mintDate: patent[5],
      isTransferable: patent[6],
      tokenURI,
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Token does not exist")) {
      return null
    }
    if (error instanceof Error) {
      throw new Error(`Failed to get Patent NFT: ${error.message}`)
    }
    throw new Error("Failed to get Patent NFT: Unknown error")
  }
}

export async function isPatentMinted(documentHash: string, contractAddress: string): Promise<boolean> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    if (!documentHash) {
      throw new Error("Document hash is required")
    }

    const provider = await getReadOnlyProvider()
    const contract = new Contract(contractAddress, PATENT_NFT_ABI, provider)
    return (await contract.isMinted(hexToBytes32(documentHash))) as boolean
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to check if patent is minted: ${error.message}`)
    }
    throw new Error("Failed to check if patent is minted: Unknown error")
  }
}

export async function tokenExists(tokenId: number | bigint, contractAddress: string): Promise<boolean> {
  try {
    if (!isValidAddress(contractAddress)) {
      return false
    }

    const provider = await getReadOnlyProvider()
    const contract = new Contract(contractAddress, PATENT_NFT_ABI, provider)
    
    // Try to get the owner of the token - this will fail if token doesn't exist
    await contract.ownerOf(tokenId)
    return true
  } catch {
    return false
  }
}

export async function getPatentsByOwner(owner: string, contractAddress: string): Promise<bigint[]> {
  try {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`)
    }

    if (!isValidAddress(owner)) {
      throw new Error(`Invalid owner address: ${owner}`)
    }

    const provider = await getReadOnlyProvider()
    const contract = new Contract(contractAddress, PATENT_NFT_ABI, provider)
    return (await contract.getPatentsByOwner(owner)) as bigint[]
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get patents by owner: ${error.message}`)
    }
    throw new Error("Failed to get patents by owner: Unknown error")
  }
}

export async function getMintFee(_contractAddress: string): Promise<bigint> {
  return 0n
}

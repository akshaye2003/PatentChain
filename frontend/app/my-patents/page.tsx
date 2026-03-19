"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  Upload,
  Wallet,
  CheckCircle,
  Loader2,
  Copy,
  ExternalLink,
  FileText,
  Hash,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ImageIcon,
  Clock,
  LinkIcon,
  Search,
  Plus,
  LayoutGrid,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  checkDocumentRegistered,
  connectWallet,
  getContractAddress,
  getDocumentInfo,
  getWalletAddress,
  isMetaMaskInstalled,
  mintPatentNFT,
  getPatentsByOwner,
  getPatentNFT,
  getPatentNFTContractAddress,
  getMintFee,
  isPatentMinted,
  type PatentNFT,
} from "@/lib/web3"
import { uploadToIPFS, validatePatentFile, type IPFSUploadResult } from "@/lib/ipfs"

// Types
interface NFTMetadata {
  tokenId: bigint
  patent: PatentNFT
}

interface MintFormData {
  title: string
  description: string
  ipfsHash: string
  isTransferable: boolean
}

interface DocumentProof {
  fileName: string
  fileSize: number
  fileHash: string
  timestamp: string
  transactionHash?: string
  blockNumber?: number
  status: "pending" | "confirmed" | "failed"
}

export default function MyPatentsPage() {
  // ============ Wallet State ============
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  // ============ NFT Gallery State ============
  const [ownedNFTs, setOwnedNFTs] = useState<NFTMetadata[]>([])
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)

  // ============ Mint Form State ============
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileHash, setFileHash] = useState("")
  const [isGeneratingHash, setIsGeneratingHash] = useState(false)
  const [mintForm, setMintForm] = useState<MintFormData>({
    title: "",
    description: "",
    ipfsHash: "",
    isTransferable: true,
  })
  const [isMinting, setIsMinting] = useState(false)
  const [mintFee, setMintFee] = useState<bigint>(BigInt(0))
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false)
  const [ipfsUploadResult, setIpfsUploadResult] = useState<IPFSUploadResult | null>(null)

  // ============ Verify Document State ============
  const [verifyFile, setVerifyFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [documentProof, setDocumentProof] = useState<DocumentProof | null>(null)

  // ============ Effects ============
  useEffect(() => {
    checkWalletConnection()
  }, [])

  useEffect(() => {
    if (walletConnected && walletAddress) {
      loadOwnedNFTs()
      loadMintFee()
    }
  }, [walletConnected, walletAddress])

  // ============ Wallet Functions ============
  const checkWalletConnection = async () => {
    try {
      const address = await getWalletAddress()
      if (address) {
        setWalletAddress(address)
        setWalletConnected(true)
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }

  const handleConnectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this feature.",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    try {
      const address = await connectWallet()
      setWalletAddress(address)
      setWalletConnected(true)
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // ============ NFT Gallery Functions ============
  const loadMintFee = async () => {
    try {
      const contractAddress = getPatentNFTContractAddress()
      const fee = await getMintFee(contractAddress)
      setMintFee(fee)
    } catch (error) {
      console.error("Error loading mint fee:", error)
    }
  }

  const loadOwnedNFTs = async (silent: boolean = false) => {
    if (!walletAddress) return

    setIsLoadingNFTs(true)
    try {
      const contractAddress = getPatentNFTContractAddress()
      const tokenIds = await getPatentsByOwner(walletAddress, contractAddress)

      const nfts: NFTMetadata[] = []
      let skippedCount = 0
      
      for (const tokenId of tokenIds) {
        try {
          const patent = await getPatentNFT(tokenId, contractAddress)
          if (patent) {
            nfts.push({ tokenId, patent })
          } else {
            console.warn(`Token ${tokenId} does not exist (burned)`)
            skippedCount++
          }
        } catch (error) {
          // Token might have been burned or doesn't exist - skip it
          console.warn(`Skipping NFT ${tokenId}:`, error)
          skippedCount++
        }
      }

      setOwnedNFTs(nfts)
      
      // Only show toast if some tokens were skipped and not in silent mode
      if (skippedCount > 0 && !silent) {
        toast({
          title: "Some NFTs Skipped",
          description: `${skippedCount} token(s) could not be loaded (may have been burned).`,
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error loading NFTs:", error)
      if (!silent) {
        toast({
          title: "Failed to Load NFTs",
          description: error instanceof Error ? error.message : "Could not load your NFTs",
          variant: "destructive",
          })
      }
    } finally {
      setIsLoadingNFTs(false)
    }
  }

  // ============ Mint Functions ============
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileHash("")
      setIpfsUploadResult(null)
      setMintForm(prev => ({ ...prev, ipfsHash: "" }))
    }
  }, [])

  const generateFileHash = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a patent PDF file first.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingHash(true)
    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

      setFileHash(hashHex)
      toast({
        title: "Hash Generated",
        description: "Document hash has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating hash:", error)
      toast({
        title: "Hash Generation Failed",
        description: "Failed to generate document hash. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingHash(false)
    }
  }

  const handleUploadToIPFS = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a patent PDF file first.",
        variant: "destructive",
      })
      return
    }

    const validation = validatePatentFile(selectedFile)
    if (!validation.valid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    if (!mintForm.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your patent before uploading.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingToIPFS(true)
    try {
      const result = await uploadToIPFS(
        selectedFile,
        mintForm.title,
        mintForm.description
      )
      
      setIpfsUploadResult(result)
      setFileHash(result.documentHash.slice(2))
      setMintForm(prev => ({ ...prev, ipfsHash: result.ipfsHash }))
      
      toast({
        title: "Upload Successful",
        description: "Your patent has been uploaded to IPFS!",
      })
    } catch (error) {
      console.error("Error uploading to IPFS:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload to IPFS",
        variant: "destructive",
      })
    } finally {
      setIsUploadingToIPFS(false)
    }
  }

  const handleMintNFT = async () => {
    if (!walletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    if (!fileHash) {
      toast({
        title: "Document Hash Required",
        description: "Please upload a file and generate its hash first.",
        variant: "destructive",
      })
      return
    }

    if (!mintForm.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your NFT.",
        variant: "destructive",
      })
      return
    }

    if (!mintForm.ipfsHash.trim()) {
      toast({
        title: "IPFS Hash Required",
        description: "Please enter the IPFS hash for your patent document.",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)
    try {
      const contractAddress = getPatentNFTContractAddress()

      const alreadyMinted = await isPatentMinted(fileHash, contractAddress)
      if (alreadyMinted) {
        toast({
          title: "Already Minted",
          description: "This patent document has already been minted as an NFT.",
          variant: "destructive",
        })
        setIsMinting(false)
        return
      }

      const result = await mintPatentNFT(
        fileHash,
        mintForm.ipfsHash,
        mintForm.title,
        mintForm.description,
        mintForm.isTransferable,
        walletAddress,
        contractAddress
      )

      toast({
        title: "NFT Minted Successfully",
        description: `Transaction: ${result.txHash.slice(0, 10)}...`,
      })

      // Reset form
      setSelectedFile(null)
      setFileHash("")
      setMintForm({
        title: "",
        description: "",
        ipfsHash: "",
        isTransferable: true,
      })

      await loadOwnedNFTs(true) // silent mode - don't show errors for burned tokens
    } catch (error) {
      console.error("Error minting NFT:", error)
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "Failed to mint NFT",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

  // ============ Verify Document Functions ============
  const handleVerifyFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setVerifyFile(file)
      setDocumentProof(null)
    }
  }, [])

  const verifyDocument = async () => {
    if (!verifyFile) {
      toast({
        title: "No File Selected",
        description: "Please select a document to verify.",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      const arrayBuffer = await verifyFile.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

      const registryAddress = getContractAddress()
      const isRegistered = await checkDocumentRegistered(hashHex, registryAddress)

      if (!isRegistered) {
        setDocumentProof({
          fileName: verifyFile.name,
          fileSize: verifyFile.size,
          fileHash: hashHex,
          timestamp: new Date().toISOString(),
          status: "failed",
        })
        toast({
          title: "Document Not Found",
          description: "This file hash is not registered on the PatentRegistry contract.",
          variant: "destructive",
        })
        return
      }

      const documentInfo = await getDocumentInfo(hashHex, registryAddress)
      const proof: DocumentProof = {
        fileName: verifyFile.name,
        fileSize: verifyFile.size,
        fileHash: hashHex,
        timestamp: new Date(Number(documentInfo.timestamp) * 1000).toISOString(),
        transactionHash: undefined,
        blockNumber: Number(documentInfo.blockNumber),
        status: "confirmed",
      }

      setDocumentProof(proof)
      toast({
        title: "Document Verified",
        description: `Registered to ${documentInfo.owner.slice(0, 6)}...${documentInfo.owner.slice(-4)}.`,
      })
    } catch (error) {
      console.error("Error verifying document:", error)
      toast({
        title: "Verification Failed",
        description: "Failed to verify document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  // ============ Utility Functions ============
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string = "Text") => {
    if (!text) {
      toast({
        title: "Nothing to Copy",
        description: `The ${label} is empty.`,
        variant: "destructive",
      })
      return
    }

    console.log(`[Copy] Attempting to copy ${label}:`, text.substring(0, 20) + "...")

    // Method 1: Modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        setCopiedText(text)
        toast({
          title: "✓ Copied!",
          description: `${label} copied to clipboard.`,
        })
        setTimeout(() => setCopiedText(null), 2000)
        console.log("[Copy] Success using Clipboard API")
        return
      } catch (err) {
        console.error("[Copy] Clipboard API failed:", err)
      }
    }

    // Method 2: Fallback using textarea
    try {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        opacity: 0;
      `
      document.body.appendChild(textArea)
      
      // For mobile devices
      const range = document.createRange()
      range.selectNodeContents(textArea)
      
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
      
      textArea.select()
      textArea.setSelectionRange(0, text.length)
      
      const successful = document.execCommand("copy")
      document.body.removeChild(textArea)
      
      if (successful) {
        setCopiedText(text)
        toast({
          title: "✓ Copied!",
          description: `${label} copied to clipboard.`,
        })
        setTimeout(() => setCopiedText(null), 2000)
        console.log("[Copy] Success using textarea fallback")
        return
      }
    } catch (err) {
      console.error("[Copy] Textarea fallback failed:", err)
    }

    // Method 3: Show text in prompt for manual copy
    console.log("[Copy] All methods failed, showing prompt")
    toast({
      title: "Copy Failed",
      description: "Opening text for manual copy...",
      variant: "destructive",
    })
    
    // Show the text in a modal-like way
    window.prompt(`Copy this ${label} (Ctrl+C):`, text)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-4">
            My Patents
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your patent portfolio. Register new patents as NFTs, view your collection, 
            and verify document authenticity.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Wallet Connection Banner */}
          <Card className="mb-8 border-border">
            <CardContent className="pt-6">
              {walletConnected ? (
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Wallet Connected</p>
                      <p className="text-sm text-muted-foreground font-mono">{walletAddress}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Connected
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <p className="text-muted-foreground">Connect your wallet to manage patents</p>
                  </div>
                  <Button onClick={handleConnectWallet} disabled={isConnecting}>
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        Connect Wallet
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="gallery" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 lg:w-[500px] mx-auto">
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                My NFTs
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Register
              </TabsTrigger>
              <TabsTrigger value="verify" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Verify
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: My NFTs Gallery */}
            <TabsContent value="gallery" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Patent NFTs</h2>
                <Button variant="outline" onClick={loadOwnedNFTs} disabled={isLoadingNFTs}>
                  {isLoadingNFTs ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>

              {!walletConnected ? (
                <Card className="p-12 text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground">Connect your wallet to view your patent NFTs.</p>
                </Card>
              ) : isLoadingNFTs ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : ownedNFTs.length === 0 ? (
                <Card className="p-12 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Patents Found</h3>
                  <p className="text-muted-foreground mb-4">You don&apos;t have any patent NFTs yet.</p>
                  <Button onClick={() => document.querySelector('[value="register"]')?.dispatchEvent(new Event('click'))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Register Your First Patent
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedNFTs.map((nft) => (
                    <Card key={nft.tokenId.toString()} className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{nft.patent.title}</CardTitle>
                            <CardDescription>Token ID: {nft.tokenId.toString()}</CardDescription>
                          </div>
                          <Badge variant={nft.patent.isTransferable ? "default" : "secondary"}>
                            {nft.patent.isTransferable ? "Transferable" : "Non-Transferable"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {nft.patent.description}
                        </p>
                        
                        <Separator />
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Inventor:</span>
                            <code className="text-xs">{nft.patent.inventor.slice(0, 8)}...{nft.patent.inventor.slice(-6)}</code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Minted:</span>
                            <span>{formatDate(nft.patent.mintDate)}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            disabled={!nft.patent.ipfsHash}
                            onClick={() => nft.patent.ipfsHash && window.open(`https://gateway.pinata.cloud/ipfs/${nft.patent.ipfsHash}`, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View File
                          </Button>
                          <Button 
                            variant={copiedText === nft.patent.documentHash ? "default" : "outline"} 
                            size="sm" 
                            className="flex-1 transition-all"
                            onClick={() => copyToClipboard(nft.patent.documentHash, "Hash")}
                          >
                            {copiedText === nft.patent.documentHash ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Copy className="h-3 w-3 mr-1" />
                            )}
                            Copy Hash
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Register Patent */}
            <TabsContent value="register" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Register New Patent NFT
                    </CardTitle>
                    <CardDescription>
                      Upload your patent document and mint it as an NFT on the blockchain.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="patent-file">Patent Document (PDF)</Label>
                      <Input
                        id="patent-file"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="bg-background"
                      />
                      <p className="text-sm text-muted-foreground">
                        Upload your patent PDF file. Max 10MB.
                      </p>
                    </div>

                    {selectedFile && (
                      <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={generateFileHash}
                          disabled={isGeneratingHash}
                        >
                          {isGeneratingHash ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Hash className="h-4 w-4" />
                          )}
                          <span className="ml-2">Generate Hash</span>
                        </Button>
                      </div>
                    )}

                    {fileHash && (
                      <Alert className="bg-primary/5 border-primary/20">
                        <Hash className="h-4 w-4 text-primary" />
                        <AlertDescription className="font-mono text-xs break-all">
                          {fileHash}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Separator />

                    {/* Patent Details */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Patent Title *</Label>
                        <Input
                          id="title"
                          value={mintForm.title}
                          onChange={(e) => setMintForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter patent title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={mintForm.description}
                          onChange={(e) => setMintForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your invention..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ipfs-hash">IPFS Hash *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="ipfs-hash"
                            value={mintForm.ipfsHash}
                            onChange={(e) => setMintForm(prev => ({ ...prev, ipfsHash: e.target.value }))}
                            placeholder="Qm..."
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            onClick={handleUploadToIPFS}
                            disabled={isUploadingToIPFS || !selectedFile}
                          >
                            {isUploadingToIPFS ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            <span className="ml-2">Upload</span>
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="transferable"
                          checked={mintForm.isTransferable}
                          onChange={(e) => setMintForm(prev => ({ ...prev, isTransferable: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="transferable" className="text-sm cursor-pointer">
                          Allow transfer of this NFT
                        </Label>
                      </div>
                    </div>

                    <Separator />

                    {/* Mint Button */}
                    <Button 
                      onClick={handleMintNFT} 
                      disabled={isMinting || !walletConnected || !fileHash || !mintForm.title || !mintForm.ipfsHash}
                      className="w-full"
                      size="lg"
                    >
                      {isMinting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Minting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Mint Patent NFT
                        </>
                      )}
                    </Button>

                    {!walletConnected && (
                      <p className="text-sm text-center text-muted-foreground">
                        Connect your wallet to mint NFTs
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab 3: Verify Document */}
            <TabsContent value="verify" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      Verify Document Authenticity
                    </CardTitle>
                    <CardDescription>
                      Upload a document to verify its blockchain registration and generate a cryptographic hash.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="verify-file">Select Document</Label>
                      <Input
                        id="verify-file"
                        type="file"
                        onChange={handleVerifyFileUpload}
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        className="bg-background"
                      />
                      <p className="text-sm text-muted-foreground">
                        Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG
                      </p>
                    </div>

                    {verifyFile && (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium">{verifyFile.name}</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(verifyFile.size)}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={verifyDocument} 
                      disabled={!verifyFile || isVerifying}
                      className="w-full"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Verify Document
                        </>
                      )}
                    </Button>

                    {documentProof && (
                      <div className="space-y-4">
                        <Separator />
                        <div
                          className={`rounded-lg border p-4 space-y-3 ${
                            documentProof.status === "confirmed"
                              ? "bg-primary/5 border-primary/20"
                              : "bg-destructive/5 border-destructive/20"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle
                              className={`h-5 w-5 ${
                                documentProof.status === "confirmed" ? "text-primary" : "text-destructive"
                              }`}
                            />
                            <span className="font-medium">
                              {documentProof.status === "confirmed" ? "Verification Complete" : "Not Registered"}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">File:</span>
                              <span className="font-medium">{documentProof.fileName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Size:</span>
                              <span>{formatFileSize(documentProof.fileSize)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Timestamp:</span>
                              <span>{new Date(documentProof.timestamp).toLocaleString()}</span>
                            </div>
                            {documentProof.blockNumber && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Block:</span>
                                <span>{documentProof.blockNumber.toLocaleString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            <Label className="text-xs">SHA-256 Hash</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="flex-1 bg-background p-2 rounded text-xs break-all">
                                {documentProof.fileHash}
                              </code>
                              <Button 
                                size="icon" 
                                variant={copiedText === documentProof.fileHash ? "default" : "outline"}
                                onClick={() => copyToClipboard(documentProof.fileHash, "Hash")}
                                className="transition-all"
                              >
                                {copiedText === documentProof.fileHash ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  )
}

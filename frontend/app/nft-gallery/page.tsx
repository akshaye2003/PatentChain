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
  ImageIcon,
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
  Coins,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  connectWallet,
  getWalletAddress,
  isMetaMaskInstalled,
  mintPatentNFT,
  getPatentsByOwner,
  getPatentNFT,
  getPatentNFTContractAddress,
  getMintFee,
  isPatentMinted,
  hexToBytes32,
  type PatentNFT,
} from "@/lib/web3"
import { uploadToIPFS, validatePatentFile, type IPFSUploadResult } from "@/lib/ipfs"
import { ethers } from "ethers"

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

export default function NFTGalleryPage() {
  // Wallet state
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  // NFTs state
  const [ownedNFTs, setOwnedNFTs] = useState<NFTMetadata[]>([])
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState("gallery")

  // Mint form state
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
  
  // IPFS upload state
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false)
  const [ipfsUploadResult, setIpfsUploadResult] = useState<IPFSUploadResult | null>(null)

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection()
  }, [])

  // Load NFTs when wallet is connected
  useEffect(() => {
    if (walletConnected && walletAddress) {
      loadOwnedNFTs()
      loadMintFee()
    }
  }, [walletConnected, walletAddress])

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

  const loadMintFee = async () => {
    try {
      const contractAddress = getPatentNFTContractAddress()
      const fee = await getMintFee(contractAddress)
      setMintFee(fee)
    } catch (error) {
      console.error("Error loading mint fee:", error)
    }
  }

  const loadOwnedNFTs = async () => {
    if (!walletAddress) return

    setIsLoadingNFTs(true)
    try {
      const contractAddress = getPatentNFTContractAddress()
      const tokenIds = await getPatentsByOwner(walletAddress, contractAddress)

      const nfts: NFTMetadata[] = []
      for (const tokenId of tokenIds) {
        try {
          const patent = await getPatentNFT(tokenId, contractAddress)
          nfts.push({ tokenId, patent })
        } catch (error) {
          console.error(`Error loading NFT ${tokenId}:`, error)
        }
      }

      setOwnedNFTs(nfts)
    } catch (error) {
      console.error("Error loading NFTs:", error)
      toast({
        title: "Failed to Load NFTs",
        description: error instanceof Error ? error.message : "Could not load your NFTs",
        variant: "destructive",
      })
    } finally {
      setIsLoadingNFTs(false)
    }
  }

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
      setFileHash(result.documentHash.slice(2)) // Remove 0x prefix for display
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

      // Check if patent is already minted
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

      const txHash = await mintPatentNFT(
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
        description: `Transaction: ${txHash.slice(0, 10)}...`,
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

      // Reload NFTs
      await loadOwnedNFTs()
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Copied to clipboard.",
    })
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

  const formatEther = (wei: bigint) => {
    return ethers.formatEther(wei)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-4">
            Patent NFT Gallery
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mint your patents as NFTs on the blockchain. Create unique digital assets representing your intellectual property.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Wallet Connection */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Web3 Wallet Connection
              </CardTitle>
              <CardDescription>
                Connect your MetaMask wallet to mint and view your Patent NFTs.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please connect your MetaMask wallet to access the NFT gallery and mint new patents.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    className="w-full sm:w-auto"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        Connect MetaMask
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {walletConnected && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="gallery">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Your Patent NFTs
                </TabsTrigger>
                <TabsTrigger value="mint">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Mint New NFT
                </TabsTrigger>
              </TabsList>

              {/* Gallery Tab */}
              <TabsContent value="gallery" className="mt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">Your Patent NFTs</h2>
                    <p className="text-muted-foreground">
                      {ownedNFTs.length} {ownedNFTs.length === 1 ? "NFT" : "NFTs"} owned
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={loadOwnedNFTs}
                    disabled={isLoadingNFTs}
                  >
                    {isLoadingNFTs ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                </div>

                {isLoadingNFTs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading your NFTs...</span>
                  </div>
                ) : ownedNFTs.length === 0 ? (
                  <Card className="border-border">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No NFTs Found</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-4">
                        You haven&apos;t minted any Patent NFTs yet. Switch to the &quot;Mint New NFT&quot; tab to create your first patent NFT.
                      </p>
                      <Button onClick={() => setActiveTab("mint")}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Mint Your First NFT
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownedNFTs.map(({ tokenId, patent }) => (
                      <Card key={tokenId.toString()} className="border-border overflow-hidden">
                        <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <div className="bg-card rounded-xl p-6 shadow-lg">
                            <ImageIcon className="h-16 w-16 text-primary" />
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg truncate">{patent.title}</CardTitle>
                            <Badge variant="secondary">#{tokenId.toString()}</Badge>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {patent.description || "No description provided"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Inventor:</span>
                            <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                              {patent.inventor.slice(0, 6)}...{patent.inventor.slice(-4)}
                            </code>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Minted:</span>
                            <span className="ml-2">{formatDate(patent.mintDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={patent.isTransferable ? "default" : "secondary"}>
                              {patent.isTransferable ? "Transferable" : "Non-Transferable"}
                            </Badge>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Patent Hash</Label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs bg-muted p-2 rounded font-mono truncate">
                                {patent.patentHash}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => copyToClipboard(patent.patentHash)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">IPFS Hash</Label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs bg-muted p-2 rounded font-mono truncate">
                                {patent.ipfsHash}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => copyToClipboard(patent.ipfsHash)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                asChild
                              >
                                <a
                                  href={`https://ipfs.io/ipfs/${patent.ipfsHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Mint Tab */}
              <TabsContent value="mint" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* File Upload & Hash Generation */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Patent Document
                      </CardTitle>
                      <CardDescription>
                        Upload your patent PDF to generate a unique hash for the NFT.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="patent-upload">Select Patent PDF</Label>
                        <Input
                          id="patent-upload"
                          type="file"
                          onChange={handleFileUpload}
                          accept=".pdf"
                          className="bg-background"
                        />
                        <p className="text-sm text-muted-foreground">
                          Supported format: PDF (Max 10MB)
                        </p>
                      </div>

                      {selectedFile && (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">{selectedFile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(selectedFile.size)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={generateFileHash}
                        disabled={!selectedFile || isGeneratingHash}
                        variant="outline"
                        className="w-full"
                      >
                        {isGeneratingHash ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Hash...
                          </>
                        ) : (
                          <>
                            <Hash className="mr-2 h-4 w-4" />
                            Generate Document Hash
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleUploadToIPFS}
                        disabled={!selectedFile || isUploadingToIPFS || !mintForm.title.trim()}
                        variant="default"
                        className="w-full bg-gradient-to-r from-primary to-primary/80"
                      >
                        {isUploadingToIPFS ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading to IPFS...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload to IPFS & Auto-Fill
                          </>
                        )}
                      </Button>

                      {fileHash && (
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <Label className="text-sm font-medium text-muted-foreground">
                            SHA-256 Hash
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="flex-1 p-2 bg-background rounded text-xs font-mono break-all">
                              {fileHash}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(fileHash)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* NFT Metadata Form */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        NFT Metadata
                      </CardTitle>
                      <CardDescription>
                        Enter the details for your Patent NFT.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nft-title">Title *</Label>
                        <Input
                          id="nft-title"
                          placeholder="e.g., Advanced Solar Cell Technology"
                          value={mintForm.title}
                          onChange={(e) =>
                            setMintForm({ ...mintForm, title: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nft-description">Description</Label>
                        <Textarea
                          id="nft-description"
                          placeholder="Describe your invention..."
                          value={mintForm.description}
                          onChange={(e) =>
                            setMintForm({ ...mintForm, description: e.target.value })
                          }
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ipfs-hash">IPFS Hash *</Label>
                        <Input
                          id="ipfs-hash"
                          placeholder="Click 'Upload to IPFS' to auto-fill..."
                          value={mintForm.ipfsHash}
                          onChange={(e) =>
                            setMintForm({ ...mintForm, ipfsHash: e.target.value })
                          }
                          readOnly={!!ipfsUploadResult}
                          className={ipfsUploadResult ? "bg-primary/5 border-primary/30" : ""}
                        />
                        <p className="text-sm text-muted-foreground">
                          {ipfsUploadResult ? (
                            <span className="text-primary">
                              ✅ Auto-filled from IPFS upload.{" "}
                              <a 
                                href={ipfsUploadResult.pdfUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="underline hover:text-primary/80"
                              >
                                View PDF ↗
                              </a>
                            </span>
                          ) : (
                            "The IPFS hash where your patent document is stored."
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is-transferable"
                          checked={mintForm.isTransferable}
                          onChange={(e) =>
                            setMintForm({ ...mintForm, isTransferable: e.target.checked })
                          }
                          className="rounded border-border"
                        />
                        <Label htmlFor="is-transferable" className="cursor-pointer">
                          Allow NFT transfers
                        </Label>
                      </div>

                      <Separator />

                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Mint Fee:</span>
                          <span className="font-medium flex items-center gap-1">
                            <Coins className="h-4 w-4" />
                            {formatEther(mintFee)} ETH
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleMintNFT}
                        disabled={
                          !fileHash ||
                          !mintForm.title.trim() ||
                          !mintForm.ipfsHash.trim() ||
                          isMinting ||
                          isUploadingToIPFS
                        }
                        className="w-full"
                      >
                        {isMinting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Minting NFT...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Mint Patent NFT
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!walletConnected && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please connect your wallet to view your NFT gallery and mint new Patent NFTs.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif font-bold text-2xl text-foreground text-center mb-8">
            How Patent NFT Minting Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">1. Upload to IPFS</h3>
              <p className="text-sm text-muted-foreground">
                Upload your patent PDF. We auto-generate the hash and upload to IPFS for you.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Hash className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">2. Add Details</h3>
              <p className="text-sm text-muted-foreground">
                Enter the NFT title and description. IPFS hash is auto-filled.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">3. Mint NFT</h3>
              <p className="text-sm text-muted-foreground">
                Pay the minting fee and create your unique Patent NFT on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  Upload,
  Hash,
  CheckCircle,
  Clock,
  Wallet,
  LinkIcon,
  FileText,
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  connectWallet,
  getWalletAddress,
  isMetaMaskInstalled,
  registerDocument,
  getContractAddress,
} from "@/lib/web3"

interface DocumentProof {
  fileName: string
  fileSize: number
  fileHash: string
  timestamp: string
  transactionHash?: string
  blockNumber?: number
  status: "pending" | "confirmed" | "failed"
}

export default function PatentProtectionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isHashing, setIsHashing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentProof, setDocumentProof] = useState<DocumentProof | null>(null)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setDocumentProof(null)
    }
  }, [])

  const checkWalletConnection = async () => {
    try {
      const address = await getWalletAddress()
      if (address) {
        setWalletAddress(address)
        setWalletConnected(true)
      }
    } catch (error) {
      console.error("Error checking wallet:", error)
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

  const generateHash = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a document to generate hash.",
        variant: "destructive",
      })
      return
    }

    setIsHashing(true)
    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

      const proof: DocumentProof = {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileHash: hashHex,
        timestamp: new Date().toISOString(),
        status: "pending",
      }

      setDocumentProof(proof)
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
      setIsHashing(false)
    }
  }

  const submitToBlockchain = async () => {
    if (!documentProof || !walletConnected) {
      toast({
        title: "Requirements Not Met",
        description: "Please generate hash and connect wallet first.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const contractAddress = getContractAddress()
      
      const result = await registerDocument(
        documentProof.fileHash,
        documentProof.fileName,
        contractAddress
      )

      setDocumentProof((prev) =>
        prev
          ? {
              ...prev,
              transactionHash: result.txHash,
              blockNumber: result.blockNumber,
              status: "confirmed",
            }
          : null,
      )

      toast({
        title: "Blockchain Proof Created",
        description: `Transaction: ${result.txHash.slice(0, 10)}...`,
      })
    } catch (error) {
      console.error("Error submitting to blockchain:", error)
      setDocumentProof((prev) => (prev ? { ...prev, status: "failed" } : null))
      toast({
        title: "Blockchain Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit proof",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Hash copied to clipboard.",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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
            Patent Protection
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure your intellectual property on the blockchain. Create immutable proof of your patent documents with timestamp verification.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Wallet Connection */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Web3 Wallet Connection
              </CardTitle>
              <CardDescription>Connect your MetaMask wallet to submit proofs to the blockchain.</CardDescription>
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
                <Button onClick={handleConnectWallet} disabled={isConnecting} className="w-full sm:w-auto">
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
              )}
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Patent Document Upload
              </CardTitle>
              <CardDescription>
                Upload your patent document to generate a cryptographic hash for blockchain protection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patent-upload">Select Patent Document</Label>
                <Input
                  id="patent-upload"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  className="bg-background"
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG (Max 10MB)
                </p>
              </div>

              {selectedFile && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={generateHash} disabled={!selectedFile || isHashing} className="w-full sm:w-auto">
                {isHashing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Hash...
                  </>
                ) : (
                  <>
                    <Hash className="mr-2 h-4 w-4" />
                    Generate Hash
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Document Proof */}
          {documentProof && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Document Proof
                </CardTitle>
                <CardDescription>Cryptographic proof and blockchain verification details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">File Name</Label>
                    <p className="text-foreground font-mono text-sm">{documentProof.fileName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">File Size</Label>
                    <p className="text-foreground">{formatFileSize(documentProof.fileSize)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Timestamp</Label>
                    <p className="text-foreground">{new Date(documentProof.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2">
                      {documentProof.status === "pending" && <Clock className="h-4 w-4 text-yellow-500" />}
                      {documentProof.status === "confirmed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {documentProof.status === "failed" && <Shield className="h-4 w-4 text-red-500" />}
                      <Badge
                        variant={documentProof.status === "confirmed" ? "default" : "secondary"}
                        className={
                          documentProof.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : documentProof.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {documentProof.status.charAt(0).toUpperCase() + documentProof.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">SHA-256 Hash</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                      {documentProof.fileHash}
                    </code>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(documentProof.fileHash)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {documentProof.transactionHash && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Transaction Hash</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                        {documentProof.transactionHash}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(documentProof.transactionHash!)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {documentProof.blockNumber && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Block Number</Label>
                    <p className="text-foreground font-mono">{documentProof.blockNumber.toLocaleString()}</p>
                  </div>
                )}

                {documentProof.status === "pending" && (
                  <Button
                    onClick={submitToBlockchain}
                    disabled={!walletConnected || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting to Blockchain...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Submit to Blockchain
                      </>
                    )}
                  </Button>
                )}

                {documentProof.status === "confirmed" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your patent document has been successfully recorded on the blockchain. This creates an immutable
                      timestamp proving the existence of your document at this point in time.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif font-bold text-2xl text-foreground text-center mb-8">
            How Patent Protection Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Hash className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">1. Generate Hash</h3>
              <p className="text-sm text-muted-foreground">
                Create a unique SHA-256 cryptographic fingerprint of your patent document.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">2. Blockchain Record</h3>
              <p className="text-sm text-muted-foreground">
                Submit the hash to the blockchain with an immutable timestamp.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">3. Permanent Proof</h3>
              <p className="text-sm text-muted-foreground">
                Receive verifiable proof of your patent's existence and integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

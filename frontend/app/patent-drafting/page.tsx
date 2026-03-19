"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Brain, Download, FileText, Image as ImageIcon, Loader2, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function PatentDraftingPage() {
  const [inventionTitle, setInventionTitle] = useState("")
  const [inventionDescription, setInventionDescription] = useState("")
  const [patentDraft, setPatentDraft] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isGenImages, setIsGenImages] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const handleGenerate = async () => {
    if (!inventionTitle.trim() || !inventionDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both invention title and description.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-patent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: inventionTitle,
          description: inventionDescription,
          technicalSpecs: inventionDescription, // fallback to description if dedicated field not present
          uniqueFeatures: inventionDescription,
          problemSolved: inventionDescription,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate patent draft")
      }

      const data = await response.json()
      setPatentDraft(data.patentDraft ?? data.draft ?? "")
      toast({
        title: "Patent Draft Generated",
        description: "Your AI-powered patent draft is ready for review.",
      })
    } catch (error) {
      console.error("Error generating patent:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate patent draft. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateImages = async () => {
    if (!inventionTitle.trim() || !inventionDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both invention title and description.",
        variant: "destructive",
      })
      return
    }

    setIsGenImages(true)
    try {
      const prompt = `Patent illustration for "${inventionTitle}". Technical schematic, clear labeled view, minimal style, white background, high-resolution, professional patent figure, line-art style.`

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) throw new Error("Failed to generate images")
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setImages(Array.isArray(data.images) ? data.images : [])
      toast({ title: "Images Ready", description: "Patent-style illustrations generated." })
    } catch (error) {
      console.error("Error generating images:", error)
      toast({ title: "Image Generation Failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsGenImages(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!patentDraft) {
      toast({
        title: "No Draft Available",
        description: "Please generate a patent draft first.",
        variant: "destructive",
      })
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: inventionTitle,
          content: patentDraft,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${inventionTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_patent_draft.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "PDF Downloaded",
        description: "Your patent draft has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-4">AI-Powered Patent Drafting</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your invention ideas into professional patent drafts using advanced AI technology. Get started in
            minutes, not months.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Invention Details
                </CardTitle>
                <CardDescription>
                  Provide detailed information about your invention to generate a comprehensive patent draft.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="invention-title">Invention Title</Label>
                  <Input
                    id="invention-title"
                    placeholder="e.g., Smart Home Energy Management System"
                    value={inventionTitle}
                    onChange={(e) => setInventionTitle(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invention-description">Invention Description</Label>
                  <Textarea
                    id="invention-description"
                    placeholder="Describe your invention in detail. Include the problem it solves, how it works, key features, technical specifications, and what makes it unique or innovative..."
                    value={inventionDescription}
                    onChange={(e) => setInventionDescription(e.target.value)}
                    className="min-h-[300px] bg-background resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Tip: The more detailed your description, the better the AI-generated patent draft will be.
                  </p>
                </div>

                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Patent Draft...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Patent Draft
                    </>
                  )}
                </Button>

                <Button onClick={handleGenerateImages} disabled={isGenImages} className="w-full" variant="secondary">
                  {isGenImages ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Images...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-5 w-5" /> Generate Patent Images
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI-Generated Patent Draft
                </CardTitle>
                <CardDescription>Your professional patent draft will appear here once generated.</CardDescription>
              </CardHeader>
              <CardContent>
                {patentDraft ? (
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 max-h-[400px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                        {patentDraft}
                      </pre>
                    </div>
                    <Button onClick={handleDownloadPDF} disabled={isDownloading} className="w-full" size="lg">
                      {isDownloading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5" />
                          Download as PDF
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No patent draft generated yet</p>
                    <p className="text-sm text-muted-foreground">
                      Fill in your invention details and click "Generate Patent Draft" to get started.
                    </p>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Generated Images</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {images.map((src, idx) => (
                        <a key={idx} href={src} target="_blank" rel="noreferrer" className="block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Patent figure ${idx + 1}`} className="w-full h-40 object-cover rounded" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif font-bold text-2xl text-foreground text-center mb-8">
            Why Use AI Patent Drafting?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Fast & Efficient</h3>
              <p className="text-sm text-muted-foreground">
                Generate professional patent drafts in minutes instead of weeks.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Leverages advanced AI to ensure comprehensive and accurate drafts.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Ready to Use</h3>
              <p className="text-sm text-muted-foreground">
                Download professional PDF drafts ready for patent office submission.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

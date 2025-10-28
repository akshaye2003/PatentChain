"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  TrendingUp,
  Users,
  Clock,
  Target,
  Wallet,
  Heart,
  Shield,
  Brain,
  Zap,
  Globe,
  Smartphone,
  Car,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Project {
  id: string
  title: string
  description: string
  category: string
  fundingGoal: number
  currentFunding: number
  backers: number
  daysLeft: number
  image: string
  creator: string
  patentStatus: "pending" | "verified" | "filed"
  tags: string[]
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "AI-Powered Smart Home Energy Optimizer",
    description:
      "Revolutionary AI system that learns your energy usage patterns and automatically optimizes power consumption, reducing electricity bills by up to 40% while maintaining comfort.",
    category: "AI & IoT",
    fundingGoal: 150000,
    currentFunding: 87500,
    backers: 234,
    daysLeft: 18,
    image: "/smart-home-energy-system.png",
    creator: "Dr. Sarah Chen",
    patentStatus: "verified",
    tags: ["AI", "Energy", "IoT", "Smart Home"],
  },
  {
    id: "2",
    title: "Blockchain-Based Supply Chain Tracker",
    description:
      "Transparent supply chain management system using blockchain technology to track products from origin to consumer, ensuring authenticity and ethical sourcing.",
    category: "Blockchain",
    fundingGoal: 200000,
    currentFunding: 45000,
    backers: 89,
    daysLeft: 25,
    image: "/blockchain-supply-chain-tracking.png",
    creator: "Michael Rodriguez",
    patentStatus: "pending",
    tags: ["Blockchain", "Supply Chain", "Transparency"],
  },
  {
    id: "3",
    title: "Neural Interface for Prosthetic Control",
    description:
      "Advanced brain-computer interface that allows amputees to control prosthetic limbs with natural thought patterns, providing unprecedented dexterity and feedback.",
    category: "Medical Tech",
    fundingGoal: 500000,
    currentFunding: 312000,
    backers: 567,
    daysLeft: 12,
    image: "/neural-prosthetic-interface.png",
    creator: "Prof. Elena Vasquez",
    patentStatus: "filed",
    tags: ["Medical", "Neural", "Prosthetics", "AI"],
  },
  {
    id: "4",
    title: "Quantum-Enhanced Encryption Protocol",
    description:
      "Next-generation encryption system leveraging quantum computing principles to create unbreakable security for digital communications and data storage.",
    category: "Quantum Computing",
    fundingGoal: 300000,
    currentFunding: 125000,
    backers: 156,
    daysLeft: 30,
    image: "/quantum-encryption-security.png",
    creator: "Dr. James Liu",
    patentStatus: "verified",
    tags: ["Quantum", "Security", "Encryption"],
  },
  {
    id: "5",
    title: "Autonomous Drone Delivery Network",
    description:
      "Intelligent drone swarm system for last-mile delivery in urban areas, featuring collision avoidance, weather adaptation, and secure package handling.",
    category: "Robotics",
    fundingGoal: 400000,
    currentFunding: 180000,
    backers: 298,
    daysLeft: 22,
    image: "/autonomous-delivery-drones.png",
    creator: "Alex Thompson",
    patentStatus: "pending",
    tags: ["Drones", "Delivery", "Autonomous", "Logistics"],
  },
  {
    id: "6",
    title: "Biodegradable Electronics Platform",
    description:
      "Environmentally friendly electronic components that naturally decompose after use, reducing e-waste while maintaining performance standards.",
    category: "Green Tech",
    fundingGoal: 250000,
    currentFunding: 95000,
    backers: 178,
    daysLeft: 35,
    image: "/biodegradable-electronics.png",
    creator: "Dr. Maria Santos",
    patentStatus: "verified",
    tags: ["Green Tech", "Electronics", "Sustainability"],
  },
]

export default function CrowdfundingPage() {
  const [projects] = useState<Project[]>(mockProjects)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [contributionAmount, setContributionAmount] = useState("")
  const [isContributing, setIsContributing] = useState(false)

  const categories = ["all", "AI & IoT", "Blockchain", "Medical Tech", "Quantum Computing", "Robotics", "Green Tech"]

  const filteredProjects =
    selectedCategory === "all" ? projects : projects.filter((project) => project.category === selectedCategory)

  const connectWallet = async () => {
    try {
      // Mock wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockAddress = "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4"
      setWalletAddress(mockAddress)
      setWalletConnected(true)
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your Web3 wallet.",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleContribute = async (projectId: string) => {
    if (!walletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to contribute.",
        variant: "destructive",
      })
      return
    }

    if (!contributionAmount || Number.parseFloat(contributionAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount.",
        variant: "destructive",
      })
      return
    }

    setIsContributing(true)
    try {
      // Mock contribution transaction
      const response = await fetch("/api/contribute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          amount: contributionAmount,
          walletAddress,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process contribution")
      }

      const data = await response.json()

      toast({
        title: "Contribution Successful",
        description: `Successfully contributed $${contributionAmount} to the project!`,
      })

      setContributionAmount("")
    } catch (error) {
      console.error("Error contributing:", error)
      toast({
        title: "Contribution Failed",
        description: "Failed to process contribution. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsContributing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AI & IoT":
        return <Brain className="h-4 w-4" />
      case "Blockchain":
        return <Shield className="h-4 w-4" />
      case "Medical Tech":
        return <Heart className="h-4 w-4" />
      case "Quantum Computing":
        return <Zap className="h-4 w-4" />
      case "Robotics":
        return <Car className="h-4 w-4" />
      case "Green Tech":
        return <Globe className="h-4 w-4" />
      default:
        return <Smartphone className="h-4 w-4" />
    }
  }

  const getPatentStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case "filed":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Shield className="h-3 w-3 mr-1" />
            Filed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-4">
              Patent Crowdfunding Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and fund the next generation of innovative patents. Support inventors and be part of
              groundbreaking technologies.
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="flex justify-center mb-8">
            {walletConnected ? (
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Wallet Connected</p>
                  <p className="text-sm text-muted-foreground font-mono">{walletAddress}</p>
                </div>
              </div>
            ) : (
              <Button onClick={connectWallet} size="lg">
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet to Contribute
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === "all" ? "All Categories" : category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="border-border hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getCategoryIcon(project.category)}
                      {project.category}
                    </Badge>
                    {getPatentStatusBadge(project.patentStatus)}
                  </div>
                  <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-3">{project.description}</CardDescription>
                  <p className="text-sm text-muted-foreground">by {project.creator}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Funding Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {formatCurrency(project.currentFunding)} raised
                      </span>
                      <span className="text-muted-foreground">of {formatCurrency(project.fundingGoal)}</span>
                    </div>
                    <Progress value={getProgressPercentage(project.currentFunding, project.fundingGoal)} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{Math.round(getProgressPercentage(project.currentFunding, project.fundingGoal))}%</span>
                      <span>{project.daysLeft} days left</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {project.backers} backers
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {project.daysLeft}d left
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Contribute Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Target className="mr-2 h-4 w-4" />
                        Contribute
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contribute to {project.title}</DialogTitle>
                        <DialogDescription>
                          Support this innovative patent project and be part of the future of technology.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Funding Progress</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(getProgressPercentage(project.currentFunding, project.fundingGoal))}%
                            </span>
                          </div>
                          <Progress value={getProgressPercentage(project.currentFunding, project.fundingGoal)} />
                          <div className="flex justify-between text-sm text-muted-foreground mt-2">
                            <span>{formatCurrency(project.currentFunding)} raised</span>
                            <span>Goal: {formatCurrency(project.fundingGoal)}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contribution-amount">Contribution Amount (USD)</Label>
                          <Input
                            id="contribution-amount"
                            type="number"
                            placeholder="Enter amount"
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                            min="1"
                            step="1"
                          />
                        </div>

                        <div className="flex gap-2">
                          {[25, 50, 100, 250].map((amount) => (
                            <Button
                              key={amount}
                              variant="outline"
                              size="sm"
                              onClick={() => setContributionAmount(amount.toString())}
                              className="flex-1"
                            >
                              ${amount}
                            </Button>
                          ))}
                        </div>

                        <Button
                          onClick={() => handleContribute(project.id)}
                          disabled={!walletConnected || isContributing}
                          className="w-full"
                        >
                          {isContributing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : !walletConnected ? (
                            <>
                              <Wallet className="mr-2 h-4 w-4" />
                              Connect Wallet First
                            </>
                          ) : (
                            <>
                              <Target className="mr-2 h-4 w-4" />
                              Contribute {contributionAmount ? `$${contributionAmount}` : ""}
                            </>
                          )}
                        </Button>

                        {!walletConnected && (
                          <Button onClick={connectWallet} variant="outline" className="w-full bg-transparent">
                            <Wallet className="mr-2 h-4 w-4" />
                            Connect Wallet
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif font-bold text-2xl text-foreground text-center mb-8">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">$2.4M</p>
              <p className="text-sm text-muted-foreground">Total Funded</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">1,247</p>
              <p className="text-sm text-muted-foreground">Active Backers</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">89</p>
              <p className="text-sm text-muted-foreground">Patents Funded</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">94%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

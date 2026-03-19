import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  FileText,
  Brain,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  Wallet,
  Target,
} from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: "Submit Your Invention",
      description: "Describe your innovative idea in detail using our intuitive form interface.",
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      details: [
        "Provide invention title and comprehensive description",
        "Include technical specifications and unique features",
        "Explain the problem your invention solves",
      ],
    },
    {
      number: 2,
      title: "AI Patent Drafting",
      description: "Our advanced AI generates a professional patent draft from your invention description.",
      icon: <Brain className="h-8 w-8 text-primary" />,
      details: [
        "AI analyzes your invention for patent-worthy elements",
        "Generates comprehensive patent documentation",
        "Includes claims, technical drawings descriptions, and legal language",
      ],
    },
    {
      number: 3,
      title: "Blockchain Verification",
      description: "Secure your intellectual property with immutable blockchain proof of concept.",
      icon: <Shield className="h-8 w-8 text-primary" />,
      details: [
        "Upload your patent draft for cryptographic hashing",
        "Generate SHA-256 hash for document integrity",
        "Submit proof to blockchain for permanent timestamping",
      ],
    },
    {
      number: 4,
      title: "Launch Crowdfunding",
      description: "Present your verified patent to potential investors and backers.",
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      details: [
        "Create compelling project presentation",
        "Set funding goals and campaign duration",
        "Showcase blockchain-verified patent documentation",
      ],
    },
    {
      number: 5,
      title: "Receive Funding",
      description: "Connect with investors and receive contributions through secure Web3 transactions.",
      icon: <Target className="h-8 w-8 text-primary" />,
      details: [
        "Investors contribute using cryptocurrency wallets",
        "Smart contracts ensure transparent fund management",
        "Receive funding to develop and commercialize your patent",
      ],
    },
  ]

  const processDetails = [
    {
      category: "Patent Drafting Process",
      icon: <FileText className="h-6 w-6 text-primary" />,
      steps: [
        {
          title: "Input Analysis",
          description: "AI analyzes your invention description for key technical elements and innovations.",
        },
        {
          title: "Prior Art Research",
          description: "System checks existing patents to ensure novelty and identify differentiating factors.",
        },
        {
          title: "Draft Generation",
          description: "Professional patent draft created with proper legal language and structure.",
        },
        {
          title: "Review & Download",
          description: "Review generated draft and download as PDF for submission or further refinement.",
        },
      ],
    },
    {
      category: "Blockchain Verification Process",
      icon: <Shield className="h-6 w-6 text-primary" />,
      steps: [
        {
          title: "Document Upload",
          description: "Upload your patent draft or any intellectual property document securely.",
        },
        {
          title: "Hash Generation",
          description: "System creates unique SHA-256 cryptographic fingerprint of your document.",
        },
        {
          title: "Blockchain Submission",
          description: "Hash is recorded on blockchain with timestamp for permanent verification.",
        },
        {
          title: "Proof Certificate",
          description: "Receive blockchain transaction hash as immutable proof of your IP.",
        },
      ],
    },
    {
      category: "Crowdfunding Process",
      icon: <Users className="h-6 w-6 text-primary" />,
      steps: [
        {
          title: "Project Creation",
          description: "Create compelling campaign with verified patent documentation and funding goals.",
        },
        {
          title: "Investor Discovery",
          description: "Patent projects are showcased to our network of investors and innovation enthusiasts.",
        },
        {
          title: "Secure Contributions",
          description: "Investors contribute using Web3 wallets with smart contract protection.",
        },
        {
          title: "Fund Distribution",
          description: "Successful campaigns receive funding to develop and commercialize innovations.",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif font-bold text-4xl sm:text-5xl text-foreground mb-6">How PatentChain Works</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From invention idea to funded patent in five simple steps. Our AI-powered platform streamlines the entire
            process of patent creation, verification, and crowdfunding.
          </p>
        </div>
      </section>

      {/* Main Process Steps */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-20 w-0.5 h-24 bg-border hidden md:block" />
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Step Number and Icon */}
                  <div className="md:col-span-2 flex flex-col items-center md:items-start">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      {step.icon}
                    </div>
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {step.number}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="md:col-span-10">
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-2xl">{step.title}</CardTitle>
                        <CardDescription className="text-lg">{step.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Process Breakdown */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl text-foreground mb-4">Detailed Process Breakdown</h2>
            <p className="text-xl text-muted-foreground">
              Deep dive into each stage of the PatentChain platform workflow
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {processDetails.map((process, index) => (
              <Card key={index} className="border-border">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 rounded-lg p-2">{process.icon}</div>
                    <CardTitle className="text-lg">{process.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {process.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="relative">
                        {stepIndex < process.steps.length - 1 && (
                          <div className="absolute left-2 top-6 w-0.5 h-8 bg-border" />
                        )}
                        <div className="flex gap-3">
                          <div className="bg-primary/20 rounded-full w-4 h-4 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-medium text-foreground mb-1">{step.title}</h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl text-foreground mb-4">Why Choose PatentChain?</h2>
            <p className="text-xl text-muted-foreground">
              Revolutionary advantages over traditional patent and funding processes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">AI-Powered Efficiency</h3>
                  <p className="text-muted-foreground">
                    Generate professional patent drafts in minutes instead of weeks, reducing costs by up to 80%.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Blockchain Security</h3>
                  <p className="text-muted-foreground">
                    Immutable proof of your intellectual property with cryptographic verification and timestamping.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Global Investor Network</h3>
                  <p className="text-muted-foreground">
                    Access to worldwide network of investors specifically interested in innovative patent projects.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Transparent Funding</h3>
                  <p className="text-muted-foreground">
                    Smart contract-based crowdfunding ensures transparent, secure, and automated fund distribution.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">End-to-End Solution</h3>
                  <p className="text-muted-foreground">
                    Complete platform covering patent drafting, verification, and funding in one integrated workflow.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Web3 Integration</h3>
                  <p className="text-muted-foreground">
                    Native cryptocurrency support with seamless wallet integration for modern digital transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif font-bold text-3xl text-primary-foreground mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join the future of patent innovation and crowdfunding. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3" asChild>
              <Link href="/patent-drafting">
                Start Patent Drafting <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              asChild
            >
              <Link href="/crowdfunding">Browse Projects</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

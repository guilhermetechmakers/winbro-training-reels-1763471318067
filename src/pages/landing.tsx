import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Search, BookOpen, Award, Shield, Zap } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function LandingPage() {
  const [showDemo, setShowDemo] = useState(false)

  const features = [
    {
      icon: Video,
      title: "Micro-Learning Reels",
      description: "20-30 second video reels for quick, focused training on machine setup, tooling, and maintenance.",
    },
    {
      icon: Search,
      title: "Searchable Transcripts",
      description: "Time-synced transcripts with NLP search to find exactly what you need, when you need it.",
    },
    {
      icon: BookOpen,
      title: "Course Builder",
      description: "Assemble reels into structured courses with quizzes and certificates.",
    },
    {
      icon: Award,
      title: "Certifications",
      description: "Generate verifiable certificates upon course completion.",
    },
    {
      icon: Shield,
      title: "Tenant-Scoped",
      description: "Secure, isolated content libraries for each customer organization.",
    },
    {
      icon: Zap,
      title: "Offline Playback",
      description: "Download reels for offline viewing on registered devices.",
    },
  ]

  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for small teams",
      features: [
        "Up to 50 users",
        "100 reels",
        "Basic analytics",
        "Email support",
      ],
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "For growing organizations",
      features: [
        "Up to 200 users",
        "Unlimited reels",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large enterprises",
      features: [
        "Unlimited users",
        "Unlimited reels",
        "Custom integrations",
        "Dedicated support",
        "SSO/SAML",
        "API access",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl animate-fade-in-up">
              Micro-Learning for Manufacturing
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Short 20-30 second video reels capture machine setup, tooling, maintenance, and troubleshooting. 
              Searchable transcripts, course builder, and analytics included.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" onClick={() => setShowDemo(true)}>
                Watch Sample Reel
              </Button>
              <Link to="/signup">
                <Button size="lg" variant="outline">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need for effective training
            </h2>
            <p className="mt-2 text-lg leading-8 text-muted-foreground">
              Built specifically for manufacturing teams
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader>
                    <Icon className="h-8 w-8 text-accent mb-2" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 sm:py-32 bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-2 text-lg leading-8 text-muted-foreground">
              Choose the plan that fits your organization
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={plan.popular ? "ring-2 ring-accent" : ""}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-4 flex items-baseline gap-x-2">
                    <span className="text-4xl font-bold tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm leading-6 text-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <span className="text-success">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={plan.popular ? "default" : "outline"}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Card className="bg-accent text-accent-foreground">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Ready to get started?</CardTitle>
              <CardDescription className="text-accent-foreground/80 mt-2">
                Start your free trial today. No credit card required.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" variant="secondary">
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="bg-transparent border-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground/10">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Product</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link to="/demo" className="hover:text-foreground">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">About</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Support</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link to="/docs" className="hover:text-foreground">Documentation</Link></li>
                <li><Link to="/status" className="hover:text-foreground">Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Terms</Link></li>
                <li><Link to="/cookies" className="hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Winbro Training Reels. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sample Training Reel</DialogTitle>
            <DialogDescription>
              Watch a sample 20-30 second training reel
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Video player would be embedded here</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

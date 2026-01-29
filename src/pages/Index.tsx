import { Link } from "react-router-dom";
import { 
  Workflow, 
  Shield, 
  Zap, 
  Clock, 
  RefreshCw, 
  FileJson, 
  Lock,
  ArrowRight,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { StepCard } from "@/components/ui/StepCard";
import { StatDisplay } from "@/components/ui/StatDisplay";
import { TerminalWindow, TerminalLine } from "@/components/ui/TerminalWindow";

const features = [
  {
    icon: Shield,
    title: "Production Hardened",
    description: "Every workflow includes error handling, retries, timeouts, and dead-letter queues. Built for reliability from day one.",
  },
  {
    icon: RefreshCw,
    title: "Freshness Layer",
    description: "Ruleset automatically updates from official n8n docs and security best practices. Always generate with current standards.",
  },
  {
    icon: Zap,
    title: "Multi-AI Provider",
    description: "Choose from OpenAI, Gemini, Anthropic, or Qwen. Automatic JSON repair ensures valid output every time.",
  },
  {
    icon: FileJson,
    title: "Import Ready",
    description: "Generate n8n JSON that imports directly. No manual tweaks needed—just map credentials and activate.",
  },
  {
    icon: Lock,
    title: "Security First",
    description: "Input validation, webhook hardening, credential placeholders. Follows OWASP guidelines and platform best practices.",
  },
  {
    icon: Clock,
    title: "Flexible Export",
    description: "Primary n8n export plus Node-RED flows, mapping tables, checklists, and test plans in one download.",
  },
];

const steps = [
  {
    title: "Define Your Workflow",
    description: "Use the wizard to specify triggers, actions, data transformations, and integrations. Set compliance and logging preferences.",
  },
  {
    title: "AI Generates Spec",
    description: "Your inputs become an SC-AUTOMATION-SPEC—a canonical format that captures every detail for the compiler.",
  },
  {
    title: "Download & Import",
    description: "Get production-ready JSON. Import into n8n, map your credentials, and activate. Includes test plan and checklist.",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="badge-pill">
                <Check className="h-4 w-4" />
                Production-Grade Automation
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-foreground">AI-Powered</span>
                <br />
                <span className="text-gradient-primary">Workflow</span>
                <br />
                <span className="text-foreground">Generation</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg">
                Generate production-grade n8n workflows with AI. Built-in <strong className="text-foreground">best practices</strong>, 
                security hardening, and error handling. Import-ready JSON in seconds.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 py-4">
                <StatDisplay value="n8n" label="Primary Target" />
                <StatDisplay value="4+" label="AI Providers" />
                <StatDisplay value="100%" label="Import Ready" />
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link to="/wizard">
                  <Button size="lg" className="gap-2 glow-border-strong">
                    <Workflow className="h-5 w-5" />
                    Generate Workflow
                  </Button>
                </Link>
                <Link to="/#how-it-works">
                  <Button variant="outline" size="lg" className="gap-2">
                    How It Works
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Terminal Preview */}
            <div className="animate-fade-in">
              <TerminalWindow title="sc_automation_spec.json">
                <TerminalLine type="comment">// SC-AUTOMATION-SPEC v1</TerminalLine>
                <TerminalLine type="comment">// Production-hardened workflow</TerminalLine>
                <br />
                <TerminalLine type="keyword">{"{"}</TerminalLine>
                <TerminalLine type="text">  <span className="terminal-string">"name"</span>: <span className="terminal-string">"Order Processing Pipeline"</span>,</TerminalLine>
                <TerminalLine type="text">  <span className="terminal-string">"version"</span>: <span className="terminal-string">"1.0.0"</span>,</TerminalLine>
                <TerminalLine type="text">  <span className="terminal-string">"compliance"</span>: <span className="terminal-string">"strict"</span>,</TerminalLine>
                <br />
                <TerminalLine type="comment">  // Error handling included</TerminalLine>
                <TerminalLine type="text">  <span className="terminal-string">"errorBranch"</span>: <span className="terminal-keyword">true</span>,</TerminalLine>
                <TerminalLine type="text">  <span className="terminal-string">"retryPolicy"</span>: {"{"}</TerminalLine>
                <TerminalLine type="text">    <span className="terminal-string">"attempts"</span>: <span className="terminal-number">3</span>,</TerminalLine>
                <TerminalLine type="text">    <span className="terminal-string">"backoff"</span>: <span className="terminal-string">"exponential"</span></TerminalLine>
                <TerminalLine type="text">  {"}"},</TerminalLine>
                <br />
                <TerminalLine type="comment">  // Ruleset: 2026-01-29</TerminalLine>
                <TerminalLine type="text">  <span className="terminal-string">"status"</span>: <span className="terminal-string">"ready_to_import"</span></TerminalLine>
                <TerminalLine type="keyword">{"}"}</TerminalLine>
              </TerminalWindow>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 section-alt">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why SC-Workflow4AI?
            </h2>
            <p className="text-muted-foreground">
              Enterprise-grade workflow generation with AI, completely configurable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Three simple steps to production-ready automation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <StepCard
                key={step.title}
                number={index + 1}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/wizard">
              <Button size="lg" className="gap-2">
                Start Building
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

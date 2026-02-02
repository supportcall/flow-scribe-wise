import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Workflow,
  Zap,
  Shield,
  Bell,
  Settings,
  AlertCircle,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CreditBalance } from "@/components/credits/CreditBalance";
import { useCredits } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WizardData {
  workflowName: string;
  description: string;
  triggerType: string;
  triggerDetails: string;
  actions: string;
  integrations: string;
  complianceLevel: string;
  dataClassification: string;
  loggingLevel: string;
  alerting: string;
  aiProvider: string;
  runtimeConstraints: string;
}

const initialData: WizardData = {
  workflowName: "",
  description: "",
  triggerType: "webhook",
  triggerDetails: "",
  actions: "",
  integrations: "",
  complianceLevel: "standard",
  dataClassification: "internal",
  loggingLevel: "standard",
  alerting: "failures",
  aiProvider: "gemini",
  runtimeConstraints: "balanced",
};

const steps = [
  { id: 1, title: "Basics", icon: Workflow },
  { id: 2, title: "Trigger", icon: Zap },
  { id: 3, title: "Actions", icon: Settings },
  { id: 4, title: "Compliance", icon: Shield },
  { id: 5, title: "Generate", icon: Bell },
];

const COST_PER_USE = 1; // 1 credit = $0.01

export default function Wizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { balance, hasEnoughCredits, useCredit } = useCredits();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateData = (field: keyof WizardData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleGenerateClick = () => {
    if (!hasEnoughCredits(COST_PER_USE)) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to generate a workflow. Contact admin to add credits.",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmGenerate = async () => {
    setIsProcessing(true);
    
    const result = await useCredit(COST_PER_USE, `Workflow: ${data.workflowName}`);
    
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to process credits",
        variant: "destructive",
      });
      setIsProcessing(false);
      setShowConfirmDialog(false);
      return;
    }

    // Store data and navigate to generate page
    sessionStorage.setItem("wizardData", JSON.stringify(data));
    setShowConfirmDialog(false);
    navigate("/generate");
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.workflowName.trim().length > 0;
      case 2:
        return data.triggerType.length > 0;
      case 3:
        return data.actions.trim().length > 0;
      case 4:
        return true;
      case 5:
        return data.aiProvider.length > 0;
      default:
        return true;
    }
  };

  const canGenerate = isStepValid() && hasEnoughCredits(COST_PER_USE);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8 lg:py-12">
        <div className="container max-w-4xl">
          {/* Credit Balance Banner */}
          <div className="mb-6 flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Your Balance</p>
                <CreditBalance showLabel size="md" />
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted-foreground">Cost per generation</p>
              <p className="font-semibold text-foreground">1 credit ($0.01)</p>
            </div>
          </div>

          {/* Insufficient Credits Warning */}
          {!hasEnoughCredits(COST_PER_USE) && (
            <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <p className="font-medium text-destructive">Insufficient Credits</p>
                <p className="text-sm text-muted-foreground">
                  You need at least 1 credit to generate a workflow. Contact your administrator to add credits.
                </p>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-border">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={`wizard-step-indicator ${
                        isActive ? "active" : isCompleted ? "completed" : "pending"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="card-feature p-8 animate-fade-in">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Workflow Basics</h2>
                  <p className="text-muted-foreground">Give your automation a clear name and explain what you want it to do.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workflowName">Workflow Name *</Label>
                    <p className="text-xs text-muted-foreground">A short, memorable name for your automation</p>
                    <Input
                      id="workflowName"
                      placeholder="e.g., New Customer Welcome Email, Daily Sales Report, Invoice Generator"
                      value={data.workflowName}
                      onChange={(e) => updateData("workflowName", e.target.value)}
                      className="input-glow"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <p className="text-xs text-muted-foreground">Explain the goal in plain English — what should happen and why?</p>
                    <Textarea
                      id="description"
                      placeholder="Example: When a new customer signs up on our website, automatically send them a welcome email with their login details and a link to our getting started guide. Also add them to our CRM system and notify the sales team via Slack."
                      value={data.description}
                      onChange={(e) => updateData("description", e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Trigger Configuration</h2>
                  <p className="text-muted-foreground">Choose what starts your automation — an event, a schedule, or a manual button click.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="triggerType">Trigger Type *</Label>
                    <p className="text-xs text-muted-foreground">What event should start this workflow?</p>
                    <Select value={data.triggerType} onValueChange={(v) => updateData("triggerType", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webhook">Webhook — Another app sends data to trigger it</SelectItem>
                        <SelectItem value="schedule">Schedule — Runs automatically at set times (e.g., daily at 9am)</SelectItem>
                        <SelectItem value="manual">Manual — You click a button to run it</SelectItem>
                        <SelectItem value="email">Email Received — Runs when an email arrives</SelectItem>
                        <SelectItem value="database">Database Change — Runs when data is added/updated</SelectItem>
                        <SelectItem value="file">File Upload — Runs when a file is uploaded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="triggerDetails">Trigger Details</Label>
                    <p className="text-xs text-muted-foreground">Any specific timing, conditions, or sources? (optional)</p>
                    <Textarea
                      id="triggerDetails"
                      placeholder="Examples:
• Schedule: Every weekday at 8:00 AM Sydney time
• Webhook: From Shopify when a new order is placed
• Email: When I receive an email from suppliers@company.com
• Database: When a new row is added to the 'orders' table"
                      value={data.triggerDetails}
                      onChange={(e) => updateData("triggerDetails", e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Actions & Integrations</h2>
                  <p className="text-muted-foreground">List what your automation should do, step by step, and which apps/services it needs to connect to.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="actions">Actions to Perform *</Label>
                    <p className="text-xs text-muted-foreground">Describe each step in plain English — what should happen in order?</p>
                    <Textarea
                      id="actions"
                      placeholder="Example steps:
1. Get the customer's name and email from the incoming data
2. Look up their purchase history in our database
3. Generate a personalized thank-you message
4. Send an email to the customer
5. Log the interaction in our CRM
6. Post a summary to the #sales Slack channel"
                      value={data.actions}
                      onChange={(e) => updateData("actions", e.target.value)}
                      rows={7}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="integrations">External Integrations</Label>
                    <p className="text-xs text-muted-foreground">Which apps or services does this workflow need to connect to?</p>
                    <Textarea
                      id="integrations"
                      placeholder="Examples: Gmail, Slack, Shopify, Google Sheets, Salesforce, Stripe, Notion, Airtable, HubSpot, Mailchimp, Twilio (SMS), Microsoft Teams, Trello, Asana"
                      value={data.integrations}
                      onChange={(e) => updateData("integrations", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Compliance & Logging</h2>
                  <p className="text-muted-foreground">Choose how strictly to handle data security and what to track. Not sure? The defaults work well for most cases.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Compliance Level</Label>
                    <p className="text-xs text-muted-foreground">How strict should security checks be?</p>
                    <Select value={data.complianceLevel} onValueChange={(v) => updateData("complianceLevel", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard — Good for most business use</SelectItem>
                        <SelectItem value="strict">Strict — Extra validation and error handling</SelectItem>
                        <SelectItem value="regulated">Regulated — For healthcare, finance (HIPAA/SOC2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Classification</Label>
                    <p className="text-xs text-muted-foreground">How sensitive is the data being processed?</p>
                    <Select value={data.dataClassification} onValueChange={(v) => updateData("dataClassification", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public — Non-sensitive, can be shared openly</SelectItem>
                        <SelectItem value="internal">Internal — Business data, not for public</SelectItem>
                        <SelectItem value="confidential">Confidential — Personal info, passwords, financial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Logging Level</Label>
                    <p className="text-xs text-muted-foreground">How much detail to record for troubleshooting?</p>
                    <Select value={data.loggingLevel} onValueChange={(v) => updateData("loggingLevel", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal — Errors only, less storage</SelectItem>
                        <SelectItem value="standard">Standard — Key events and errors</SelectItem>
                        <SelectItem value="audit">Audit — Full trace of every step (debugging)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Alerting</Label>
                    <p className="text-xs text-muted-foreground">When should you be notified?</p>
                    <Select value={data.alerting} onValueChange={(v) => updateData("alerting", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="failures">Failures Only — Alert when something breaks</SelectItem>
                        <SelectItem value="daily">Daily Summary — Daily report + failure alerts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Generation Settings</h2>
                  <p className="text-muted-foreground">Pick which AI creates your workflow and how it should be optimized. Gemini + Balanced works great for most users.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>AI Provider *</Label>
                    <p className="text-xs text-muted-foreground">Which AI engine should generate your workflow code?</p>
                    <Select value={data.aiProvider} onValueChange={(v) => updateData("aiProvider", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini">Google Gemini — Fast, reliable, great all-rounder</SelectItem>
                        <SelectItem value="openai">OpenAI GPT — Excellent for complex logic</SelectItem>
                        <SelectItem value="anthropic">Anthropic Claude — Strong on accuracy and safety</SelectItem>
                        <SelectItem value="qwen">Qwen — Good for multilingual workflows</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Runtime Constraints</Label>
                    <p className="text-xs text-muted-foreground">What matters most when this workflow runs?</p>
                    <Select value={data.runtimeConstraints} onValueChange={(v) => updateData("runtimeConstraints", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low-latency">Low Latency — Fastest response time</SelectItem>
                        <SelectItem value="high-throughput">High Throughput — Handle many requests at once</SelectItem>
                        <SelectItem value="low-cost">Low Cost — Minimize running expenses</SelectItem>
                        <SelectItem value="balanced">Balanced — Good mix of speed, volume, and cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
                    <h3 className="font-semibold text-foreground mb-3">Generation Summary</h3>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="text-muted-foreground">Workflow:</dt>
                      <dd className="text-foreground">{data.workflowName || "—"}</dd>
                      <dt className="text-muted-foreground">Trigger:</dt>
                      <dd className="text-foreground capitalize">{data.triggerType}</dd>
                      <dt className="text-muted-foreground">Compliance:</dt>
                      <dd className="text-foreground capitalize">{data.complianceLevel}</dd>
                      <dt className="text-muted-foreground">Provider:</dt>
                      <dd className="text-foreground capitalize">{data.aiProvider}</dd>
                      <dt className="text-muted-foreground">Cost:</dt>
                      <dd className="text-foreground font-semibold">1 credit ($0.01)</dd>
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerateClick}
                disabled={!canGenerate}
                className="gap-2 glow-border-strong"
              >
                <Workflow className="h-4 w-4" />
                Generate Workflow (1 credit)
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Generation</AlertDialogTitle>
            <AlertDialogDescription>
              This will use <span className="font-semibold">1 credit ($0.01)</span> from your balance.
              <br /><br />
              Your current balance: <span className="font-semibold">{balance} credits</span>
              <br />
              Balance after: <span className="font-semibold">{balance - 1} credits</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmGenerate} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm & Generate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

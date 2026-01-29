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
  Settings
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

interface WizardData {
  // Step 1: Basics
  workflowName: string;
  description: string;
  
  // Step 2: Trigger
  triggerType: string;
  triggerDetails: string;
  
  // Step 3: Actions
  actions: string;
  integrations: string;
  
  // Step 4: Compliance
  complianceLevel: string;
  dataClassification: string;
  loggingLevel: string;
  alerting: string;
  
  // Step 5: Provider
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

export default function Wizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);

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

  const handleGenerate = () => {
    // Store data and navigate to generate page
    sessionStorage.setItem("wizardData", JSON.stringify(data));
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
        return true; // All have defaults
      case 5:
        return data.aiProvider.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8 lg:py-12">
        <div className="container max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-border">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Step Indicators */}
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
                  <p className="text-muted-foreground">Name and describe your automation workflow.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workflowName">Workflow Name *</Label>
                    <Input
                      id="workflowName"
                      placeholder="e.g., Order Processing Pipeline"
                      value={data.workflowName}
                      onChange={(e) => updateData("workflowName", e.target.value)}
                      className="input-glow"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this workflow does, its purpose, and key requirements..."
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
                  <p className="text-muted-foreground">Define how your workflow will be triggered.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="triggerType">Trigger Type *</Label>
                    <Select value={data.triggerType} onValueChange={(v) => updateData("triggerType", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="schedule">Schedule (Cron)</SelectItem>
                        <SelectItem value="manual">Manual Trigger</SelectItem>
                        <SelectItem value="email">Email Received</SelectItem>
                        <SelectItem value="database">Database Change</SelectItem>
                        <SelectItem value="file">File Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="triggerDetails">Trigger Details</Label>
                    <Textarea
                      id="triggerDetails"
                      placeholder="Provide additional details about the trigger (e.g., expected payload, schedule pattern, filters)..."
                      value={data.triggerDetails}
                      onChange={(e) => updateData("triggerDetails", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Actions & Integrations</h2>
                  <p className="text-muted-foreground">Describe the actions and services your workflow will use.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="actions">Actions to Perform *</Label>
                    <Textarea
                      id="actions"
                      placeholder="Describe the step-by-step actions:
1. Validate incoming data
2. Transform data to required format
3. Send to external API
4. Store results in database
5. Send notification on completion"
                      value={data.actions}
                      onChange={(e) => updateData("actions", e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="integrations">External Integrations</Label>
                    <Textarea
                      id="integrations"
                      placeholder="List the external services to integrate (e.g., Slack, Airtable, Stripe, SendGrid, custom APIs)..."
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
                  <p className="text-muted-foreground">Configure security and monitoring settings.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Compliance Level</Label>
                    <Select value={data.complianceLevel} onValueChange={(v) => updateData("complianceLevel", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="strict">Strict</SelectItem>
                        <SelectItem value="regulated">Regulated (HIPAA/SOC2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Classification</Label>
                    <Select value={data.dataClassification} onValueChange={(v) => updateData("dataClassification", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="confidential">Confidential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Logging Level</Label>
                    <Select value={data.loggingLevel} onValueChange={(v) => updateData("loggingLevel", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="audit">Audit (Full)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Alerting</Label>
                    <Select value={data.alerting} onValueChange={(v) => updateData("alerting", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="failures">Failures Only</SelectItem>
                        <SelectItem value="daily">Failures + Daily Summary</SelectItem>
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
                  <p className="text-muted-foreground">Choose your AI provider and runtime preferences.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>AI Provider *</Label>
                    <Select value={data.aiProvider} onValueChange={(v) => updateData("aiProvider", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini">Google Gemini</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                        <SelectItem value="qwen">Qwen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Runtime Constraints</Label>
                    <Select value={data.runtimeConstraints} onValueChange={(v) => updateData("runtimeConstraints", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low-latency">Low Latency</SelectItem>
                        <SelectItem value="high-throughput">High Throughput</SelectItem>
                        <SelectItem value="low-cost">Low Cost</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Summary Preview */}
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
                onClick={handleGenerate}
                disabled={!isStepValid()}
                className="gap-2 glow-border-strong"
              >
                <Workflow className="h-4 w-4" />
                Generate Workflow
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

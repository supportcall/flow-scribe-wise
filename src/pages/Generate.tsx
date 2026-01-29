import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle,
  FileJson,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TerminalWindow, TerminalLine } from "@/components/ui/TerminalWindow";
import { useToast } from "@/hooks/use-toast";

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

export default function Generate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wizardData, setWizardData] = useState<WizardData | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("wizardData");
    if (!stored) {
      navigate("/wizard");
      return;
    }

    const data = JSON.parse(stored) as WizardData;
    setWizardData(data);

    // Simulate workflow generation
    const timer = setTimeout(() => {
      const workflow = generateMockWorkflow(data);
      setGeneratedWorkflow(JSON.stringify(workflow, null, 2));
      setIsGenerating(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  const generateMockWorkflow = (data: WizardData) => {
    return {
      name: data.workflowName,
      nodes: [
        {
          parameters: {},
          id: "trigger-1",
          name: `${data.triggerType.charAt(0).toUpperCase() + data.triggerType.slice(1)} Trigger`,
          type: `n8n-nodes-base.${data.triggerType === "webhook" ? "webhook" : data.triggerType}Trigger`,
          typeVersion: 1,
          position: [250, 300],
          notes: "Entry point - validates incoming requests"
        },
        {
          parameters: {
            conditions: {
              string: [
                {
                  value1: "={{ $json.data }}",
                  operation: "isNotEmpty"
                }
              ]
            }
          },
          id: "validate-1",
          name: "Input Validation",
          type: "n8n-nodes-base.if",
          typeVersion: 1,
          position: [450, 300],
          notes: "Validates required fields exist"
        },
        {
          parameters: {
            functionCode: "// Transform data\nreturn items.map(item => ({ json: { ...item.json, processed: true } }));"
          },
          id: "transform-1",
          name: "Data Transform",
          type: "n8n-nodes-base.function",
          typeVersion: 1,
          position: [650, 200],
          notes: "Transforms data to required format"
        },
        {
          parameters: {
            errorMessage: "={{ $json.error || 'Unknown error' }}"
          },
          id: "error-1",
          name: "Error Handler",
          type: "n8n-nodes-base.stopAndError",
          typeVersion: 1,
          position: [650, 400],
          notes: "Handles validation failures"
        }
      ],
      connections: {
        "trigger-1": {
          main: [[{ node: "validate-1", type: "main", index: 0 }]]
        },
        "validate-1": {
          main: [
            [{ node: "transform-1", type: "main", index: 0 }],
            [{ node: "error-1", type: "main", index: 0 }]
          ]
        }
      },
      active: false,
      settings: {
        executionOrder: "v1",
        saveManualExecutions: true,
        errorWorkflow: "",
        timezone: "UTC"
      },
      meta: {
        generator: "SC-Workflow4AI",
        version: "1.0.0",
        ruleset_date: new Date().toISOString().split("T")[0],
        compliance: data.complianceLevel,
        data_classification: data.dataClassification,
        logging_level: data.loggingLevel
      },
      tags: ["sc-workflow4ai", "production", data.complianceLevel]
    };
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedWorkflow);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Workflow JSON copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedWorkflow], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${wizardData?.workflowName?.replace(/\s+/g, "_").toLowerCase() || "workflow"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Workflow JSON file downloaded.",
    });
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    const timer = setTimeout(() => {
      if (wizardData) {
        const workflow = generateMockWorkflow(wizardData);
        setGeneratedWorkflow(JSON.stringify(workflow, null, 2));
      }
      setIsGenerating(false);
    }, 2000);
    return () => clearTimeout(timer);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8 lg:py-12">
        <div className="container max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isGenerating ? "Generating Workflow..." : "Workflow Generated"}
            </h1>
            <p className="text-muted-foreground">
              {isGenerating 
                ? "AI is creating your production-hardened workflow with best practices..."
                : "Your n8n workflow is ready to import. Review and download below."}
            </p>
          </div>

          {/* Status */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="card-feature p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${isGenerating ? "bg-warning/10" : "bg-success/10"}`}>
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 text-warning animate-spin" />
                ) : (
                  <Check className="h-5 w-5 text-success" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold text-foreground">
                  {isGenerating ? "Generating" : "Complete"}
                </p>
              </div>
            </div>

            <div className="card-feature p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileJson className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Output Format</p>
                <p className="font-semibold text-foreground">n8n JSON</p>
              </div>
            </div>

            <div className="card-feature p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="font-semibold text-foreground capitalize">
                  {wizardData?.complianceLevel || "Standard"}
                </p>
              </div>
            </div>
          </div>

          {/* Generated Output */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Generated Workflow</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            <TerminalWindow title={`${wizardData?.workflowName?.replace(/\s+/g, "_").toLowerCase() || "workflow"}.json`}>
              {isGenerating ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Generating with {wizardData?.aiProvider || "AI"}...</p>
                  </div>
                </div>
              ) : (
                <pre className="text-sm">
                  {generatedWorkflow.split("\n").map((line, i) => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith("//")) {
                      return <TerminalLine key={i} type="comment">{line}</TerminalLine>;
                    }
                    if (trimmed.includes('"name"') || trimmed.includes('"type"')) {
                      return <TerminalLine key={i} type="keyword">{line}</TerminalLine>;
                    }
                    if (trimmed.match(/: \d+/)) {
                      return <TerminalLine key={i} type="number">{line}</TerminalLine>;
                    }
                    if (trimmed.includes('": "')) {
                      return <TerminalLine key={i} type="string">{line}</TerminalLine>;
                    }
                    return <TerminalLine key={i}>{line}</TerminalLine>;
                  })}
                </pre>
              )}
            </TerminalWindow>
          </div>

          {/* Next Steps */}
          {!isGenerating && (
            <div className="mt-8 card-feature p-6">
              <h3 className="font-semibold text-foreground mb-4">Next Steps</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="step-number w-6 h-6 text-xs">1</span>
                  <span>Download the workflow JSON file</span>
                </li>
                <li className="flex gap-3">
                  <span className="step-number w-6 h-6 text-xs">2</span>
                  <span>Import into n8n via Settings → Import Workflow</span>
                </li>
                <li className="flex gap-3">
                  <span className="step-number w-6 h-6 text-xs">3</span>
                  <span>Map your credentials to the placeholder nodes</span>
                </li>
                <li className="flex gap-3">
                  <span className="step-number w-6 h-6 text-xs">4</span>
                  <span>Test with sample data before activating</span>
                </li>
              </ol>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

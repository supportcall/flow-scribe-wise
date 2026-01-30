import { Workflow, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Workflow className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">SC-Workflow4AI</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Generate production-grade, import-ready n8n and Node-RED workflows 
              with AI-powered best practices and security hardening.
            </p>
          </div>

          {/* SupportCALL */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">SupportCALL</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://sc-cloaked.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  SC-Cloaked <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://sc-uscs.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  SC-USCS <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://wanip.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  WAN IP <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://offsitesync.co.za/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  SysAdmin AI <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://docs.n8n.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  n8n Docs <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SC-Workflow4AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70 max-w-2xl">
            SC-Workflow4AI is provided "as is" for informational purposes only. Consult with your ICT professional regarding network security. Use at your own risk.
          </p>
          <div className="flex items-center gap-2">
            <span className="freshness-badge fresh">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Ruleset Fresh
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

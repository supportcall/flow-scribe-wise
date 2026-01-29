import { ReactNode } from "react";

interface TerminalWindowProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function TerminalWindow({ title = "workflow.json", children, className = "" }: TerminalWindowProps) {
  return (
    <div className={`terminal-window glow-border ${className}`}>
      <div className="terminal-header">
        <div className="flex items-center gap-2">
          <span className="terminal-dot-red" />
          <span className="terminal-dot-yellow" />
          <span className="terminal-dot-green" />
        </div>
        <span className="text-sm text-muted-foreground ml-2 font-mono">{title}</span>
      </div>
      <div className="terminal-body scrollbar-thin overflow-auto max-h-[400px]">
        {children}
      </div>
    </div>
  );
}

interface TerminalLineProps {
  type?: "comment" | "keyword" | "string" | "number" | "text";
  children: ReactNode;
}

export function TerminalLine({ type = "text", children }: TerminalLineProps) {
  const colorClass = {
    comment: "terminal-comment",
    keyword: "terminal-keyword",
    string: "terminal-string",
    number: "terminal-number",
    text: "",
  }[type];

  return <div className={colorClass}>{children}</div>;
}

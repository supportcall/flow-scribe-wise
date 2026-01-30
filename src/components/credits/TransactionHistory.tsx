import { useCredits } from "@/hooks/useCredits";
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";

export function TransactionHistory() {
  const { transactions, isLoading } = useCredits();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-3 border border-border rounded-lg bg-background"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${tx.amount > 0 ? "bg-success/10" : "bg-destructive/10"}`}>
              {tx.amount > 0 ? (
                <ArrowDownLeft className="h-4 w-4 text-success" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-destructive" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {tx.description || tx.transaction_type.replace("_", " ")}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(tx.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${tx.amount > 0 ? "text-success" : "text-destructive"}`}>
              {tx.amount > 0 ? "+" : ""}{tx.amount}
            </p>
            <p className="text-xs text-muted-foreground">
              Balance: {tx.balance_after}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

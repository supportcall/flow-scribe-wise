import { Coins, Loader2 } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

interface CreditBalanceProps {
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function CreditBalance({ showLabel = true, size = "md" }: CreditBalanceProps) {
  const { balance, isLoading } = useCredits();

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center gap-1.5 ${textSize}`}>
      {isLoading ? (
        <Loader2 className={`${iconSize} animate-spin text-muted-foreground`} />
      ) : (
        <>
          <Coins className={`${iconSize} text-primary`} />
          <span className="font-medium text-foreground">{balance}</span>
          {showLabel && <span className="text-muted-foreground">credits</span>}
        </>
      )}
    </div>
  );
}

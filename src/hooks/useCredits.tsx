import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

interface CreditsContextType {
  balance: number;
  isLoading: boolean;
  transactions: CreditTransaction[];
  refreshBalance: () => Promise<void>;
  useCredit: (amount?: number, description?: string) => Promise<{ success: boolean; error?: string }>;
  hasEnoughCredits: (amount?: number) => boolean;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

const COST_PER_USE = 1; // 1 credit = $0.01

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { user, isApproved } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_my_credits");
      if (error) throw error;
      setBalance(data ?? 0);
    } catch (err) {
      console.error("Failed to fetch credits:", err);
      setBalance(0);
    }
    setIsLoading(false);
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data ?? []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setTransactions([]);
    }
  }, [user]);

  const refreshBalance = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchBalance(), fetchTransactions()]);
  }, [fetchBalance, fetchTransactions]);

  useEffect(() => {
    if (user && isApproved) {
      refreshBalance();
    } else {
      setBalance(0);
      setTransactions([]);
      setIsLoading(false);
    }
  }, [user, isApproved, refreshBalance]);

  const hasEnoughCredits = useCallback((amount: number = COST_PER_USE) => {
    return balance >= amount;
  }, [balance]);

  const useCredit = useCallback(async (
    amount: number = COST_PER_USE, 
    description: string = "Wizard usage"
  ): Promise<{ success: boolean; error?: string }> => {
    if (!hasEnoughCredits(amount)) {
      return { success: false, error: "Insufficient credits" };
    }

    try {
      const { data, error } = await supabase.rpc("use_credits", {
        _amount: amount,
        _description: description,
      });

      if (error) throw error;

      setBalance(data ?? 0);
      await fetchTransactions();
      return { success: true };
    } catch (err: any) {
      console.error("Failed to use credits:", err);
      return { success: false, error: err.message || "Failed to deduct credits" };
    }
  }, [hasEnoughCredits, fetchTransactions]);

  const value = {
    balance,
    isLoading,
    transactions,
    refreshBalance,
    useCredit,
    hasEnoughCredits,
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
}

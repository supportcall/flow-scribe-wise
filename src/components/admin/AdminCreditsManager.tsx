import { useState, useEffect } from "react";
import { Loader2, Plus, Minus, Search, History, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserWithCredits {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  approval_status: string;
  balance: number;
}

interface Transaction {
  id: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
  created_by: string | null;
}

interface AdminCreditsManagerProps {
  users: { id: string; user_id: string; email: string; full_name: string | null; approval_status: string }[];
  onRefresh: () => void;
}

export function AdminCreditsManager({ users, onRefresh }: AdminCreditsManagerProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDeducting, setIsDeducting] = useState(false);
  const [userCredits, setUserCredits] = useState<Record<string, number>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch credits for all users
  const fetchUserCredits = async () => {
    const { data, error } = await supabase
      .from("user_credits")
      .select("user_id, balance");

    if (!error && data) {
      const credits: Record<string, number> = {};
      data.forEach((uc) => {
        credits[uc.user_id] = uc.balance;
      });
      setUserCredits(credits);
    }
  };

  useEffect(() => {
    fetchUserCredits();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddCredits = async () => {
    if (!selectedUserId || !creditAmount) return;

    const amount = parseInt(creditAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a positive number.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);

    try {
      const { error } = await supabase.rpc("add_credits", {
        _user_id: selectedUserId,
        _amount: amount,
        _description: description || "Admin credit addition",
      });

      if (error) throw error;

      toast({
        title: "Credits Added",
        description: `Successfully added ${amount} credits.`,
      });

      setCreditAmount("");
      setDescription("");
      fetchUserCredits();
      onRefresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add credits.",
        variant: "destructive",
      });
    }

    setIsAdding(false);
  };

  const handleDeductCredits = async () => {
    if (!selectedUserId || !creditAmount) return;

    const amount = parseInt(creditAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a positive number.",
        variant: "destructive",
      });
      return;
    }

    const currentBalance = userCredits[selectedUserId] ?? 0;
    if (amount > currentBalance) {
      toast({
        title: "Insufficient Credits",
        description: `User only has ${currentBalance} credits.`,
        variant: "destructive",
      });
      return;
    }

    setIsDeducting(true);

    try {
      const { error } = await supabase.rpc("deduct_credits", {
        _user_id: selectedUserId,
        _amount: amount,
        _description: description || "Admin credit deduction",
      });

      if (error) throw error;

      toast({
        title: "Credits Deducted",
        description: `Successfully removed ${amount} credits.`,
      });

      setCreditAmount("");
      setDescription("");
      fetchUserCredits();
      onRefresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to deduct credits.",
        variant: "destructive",
      });
    }

    setIsDeducting(false);
  };

  const handleViewHistory = async (userId: string) => {
    setLoadingHistory(true);
    setShowHistory(true);

    try {
      const { data, error } = await supabase.rpc("get_user_transactions", {
        _user_id: userId,
      });

      if (error) throw error;
      setTransactions((data as Transaction[]) ?? []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load transactions.",
        variant: "destructive",
      });
      setTransactions([]);
    }

    setLoadingHistory(false);
  };

  const selectedUser = users.find((u) => u.user_id === selectedUserId);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* User List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No users found.</p>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                selectedUserId === user.user_id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => setSelectedUserId(user.user_id)}
              >
                <p className="font-medium text-foreground">
                  {user.full_name || "No name"}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {userCredits[user.user_id] ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">credits</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleViewHistory(user.user_id)}
                  title="View transaction history"
                >
                  <History className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Deduct Credits Form */}
      {selectedUserId && (
        <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Manage Credits</Label>
              <p className="text-xs text-muted-foreground">
                {selectedUser?.full_name || "No name"} ({selectedUser?.email})
              </p>
              <p className="text-sm font-medium mt-1">
                Current Balance: {userCredits[selectedUserId] ?? 0} credits
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedUserId(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="creditAmount">Amount</Label>
              <Input
                id="creditAmount"
                type="number"
                min="1"
                placeholder="Enter amount"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Reason for adjustment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddCredits}
                disabled={isAdding || isDeducting || !creditAmount}
                className="flex-1 gap-2"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Credits
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeductCredits}
                disabled={isAdding || isDeducting || !creditAmount}
                className="flex-1 gap-2"
              >
                {isDeducting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
                Deduct Credits
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              1 credit = $0.01 per wizard use
            </p>
          </div>
        </div>
      )}

      {/* Transaction History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
          </DialogHeader>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions found.
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          tx.amount > 0
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {tx.transaction_type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString()}
                      </span>
                    </div>
                    {tx.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {tx.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        tx.amount > 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Balance: {tx.balance_after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

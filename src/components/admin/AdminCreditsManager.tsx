import { useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserWithCredits {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  approval_status: string;
  balance: number;
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
  const [isAdding, setIsAdding] = useState(false);
  const [userCredits, setUserCredits] = useState<Record<string, number>>({});

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

  // Fetch on mount
  useState(() => {
    fetchUserCredits();
  });

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
        _description: "Admin credit addition",
      });

      if (error) throw error;

      toast({
        title: "Credits Added",
        description: `Successfully added ${amount} credits.`,
      });

      setCreditAmount("");
      setSelectedUserId(null);
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
              onClick={() => setSelectedUserId(user.user_id)}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedUserId === user.user_id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div>
                <p className="font-medium text-foreground">
                  {user.full_name || "No name"}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  {userCredits[user.user_id] ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">credits</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Credits Form */}
      {selectedUserId && (
        <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-4">
          <div>
            <Label htmlFor="creditAmount">Add Credits</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Selected: {users.find((u) => u.user_id === selectedUserId)?.email}
            </p>
            <div className="flex gap-2">
              <Input
                id="creditAmount"
                type="number"
                min="1"
                placeholder="Amount"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
              <Button onClick={handleAddCredits} disabled={isAdding || !creditAmount} className="gap-2">
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              1 credit = $0.01 per wizard use
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

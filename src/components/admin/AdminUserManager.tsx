import { useState, useEffect } from "react";
import {
  Loader2,
  Search,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  KeyRound,
  X,
  Save,
  User,
  Mail,
  Phone,
  FileText,
  Plus,
  Minus,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  notes: string | null;
  approval_status: string;
  is_disabled: boolean;
  created_at: string;
}

interface Transaction {
  id: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

interface AdminUserManagerProps {
  onRefresh: () => void;
}

export function AdminUserManager({ onRefresh }: AdminUserManagerProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userCredits, setUserCredits] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDescription, setCreditDescription] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data as UserProfile[]);
    }

    // Fetch credits
    const { data: creditsData } = await supabase
      .from("user_credits")
      .select("user_id, balance");

    if (creditsData) {
      const credits: Record<string, number> = {};
      creditsData.forEach((uc) => {
        credits[uc.user_id] = uc.balance;
      });
      setUserCredits(credits);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const callAdminFunction = async (
    action: string,
    userId: string,
    data?: any
  ) => {
    const { data: response, error } = await supabase.functions.invoke(
      "admin-manage-user",
      {
        body: { action, user_id: userId, data },
      }
    );

    if (error) throw error;
    if (response?.error) throw new Error(response.error);
    return response;
  };

  const handleEditClick = (user: UserProfile) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || "",
      email: user.email,
      phone: user.phone || "",
      notes: user.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!selectedUser) return;
    setProcessing(true);

    try {
      await callAdminFunction("update_profile", selectedUser.user_id, editForm);
      toast({ title: "Success", description: "Profile updated successfully." });
      setEditDialogOpen(false);
      fetchUsers();
      onRefresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update profile.",
        variant: "destructive",
      });
    }

    setProcessing(false);
  };

  const handleToggleDisable = async (user: UserProfile) => {
    setProcessing(true);
    const action = user.is_disabled ? "enable" : "disable";

    try {
      await callAdminFunction(action, user.user_id);
      toast({
        title: "Success",
        description: `User ${action}d successfully.`,
      });
      fetchUsers();
      onRefresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || `Failed to ${action} user.`,
        variant: "destructive",
      });
    }

    setProcessing(false);
  };

  const handleDeleteClick = (user: UserProfile) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setProcessing(true);

    try {
      await callAdminFunction("delete", selectedUser.user_id);
      toast({ title: "Success", description: "User deleted successfully." });
      setDeleteDialogOpen(false);
      fetchUsers();
      onRefresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete user.",
        variant: "destructive",
      });
    }

    setProcessing(false);
  };

  const handleResetPasswordClick = (user: UserProfile) => {
    setSelectedUser(user);
    setResetDialogOpen(true);
  };

  const handleConfirmReset = async () => {
    if (!selectedUser) return;
    setProcessing(true);

    try {
      const result = await callAdminFunction("reset_password", selectedUser.user_id, {
        email: selectedUser.email,
      });
      
      toast({
        title: "Password Reset Link Generated",
        description: "Copy the link below and send it to the user.",
      });

      // Show the reset link in an alert or copy to clipboard
      if (result?.resetLink) {
        await navigator.clipboard.writeText(result.resetLink);
        toast({
          title: "Link Copied",
          description: "Password reset link copied to clipboard.",
        });
      }

      setResetDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to generate reset link.",
        variant: "destructive",
      });
    }

    setProcessing(false);
  };

  const handleCreditsClick = (user: UserProfile) => {
    setSelectedUser(user);
    setCreditAmount("");
    setCreditDescription("");
    setCreditsDialogOpen(true);
  };

  const handleAddCredits = async () => {
    if (!selectedUser || !creditAmount) return;
    const amount = parseInt(creditAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    setProcessing(true);
    try {
      await supabase.rpc("add_credits", {
        _user_id: selectedUser.user_id,
        _amount: amount,
        _description: creditDescription || "Admin credit addition",
      });
      toast({ title: "Success", description: `Added ${amount} credits.` });
      fetchUsers();
      setCreditAmount("");
      setCreditDescription("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add credits.",
        variant: "destructive",
      });
    }
    setProcessing(false);
  };

  const handleDeductCredits = async () => {
    if (!selectedUser || !creditAmount) return;
    const amount = parseInt(creditAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    setProcessing(true);
    try {
      await supabase.rpc("deduct_credits", {
        _user_id: selectedUser.user_id,
        _amount: amount,
        _description: creditDescription || "Admin credit deduction",
      });
      toast({ title: "Success", description: `Deducted ${amount} credits.` });
      fetchUsers();
      setCreditAmount("");
      setCreditDescription("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to deduct credits.",
        variant: "destructive",
      });
    }
    setProcessing(false);
  };

  const handleViewHistory = async (user: UserProfile) => {
    setSelectedUser(user);
    setLoadingHistory(true);
    setHistoryDialogOpen(true);

    try {
      const { data, error } = await supabase.rpc("get_user_transactions", {
        _user_id: user.user_id,
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

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* User List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No users found.</p>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`p-4 border rounded-lg transition-colors ${
                user.is_disabled
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground truncate">
                      {user.full_name || "No name"}
                    </p>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.approval_status === "approved"
                          ? "bg-success/10 text-success"
                          : user.approval_status === "pending"
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {user.approval_status}
                    </span>
                    {user.is_disabled && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  {user.phone && (
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Credits: {userCredits[user.user_id] ?? 0}</span>
                    <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(user)}
                    title="Edit profile"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCreditsClick(user)}
                    title="Manage credits"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewHistory(user)}
                    title="Transaction history"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleResetPasswordClick(user)}
                    title="Reset password"
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleDisable(user)}
                    disabled={processing}
                    title={user.is_disabled ? "Enable user" : "Disable user"}
                  >
                    {user.is_disabled ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Ban className="h-4 w-4 text-warning" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(user)}
                    title="Delete user"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user information and contact details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-name"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="pl-10"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Admin Notes</Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
                placeholder="Internal notes about this user..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={processing}>
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credits Management Dialog */}
      <Dialog open={creditsDialogOpen} onOpenChange={setCreditsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Credits</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name || selectedUser?.email} — Current balance:{" "}
              {userCredits[selectedUser?.user_id || ""] ?? 0} credits
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="credit-amount">Amount</Label>
              <Input
                id="credit-amount"
                type="number"
                min="1"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit-desc">Description (optional)</Label>
              <Input
                id="credit-desc"
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                placeholder="Reason for adjustment"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreditsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeductCredits}
              disabled={processing || !creditAmount}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Minus className="h-4 w-4 mr-2" />}
              Deduct
            </Button>
            <Button onClick={handleAddCredits} disabled={processing || !creditAmount}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{selectedUser?.email}</strong> and all their data. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Confirmation */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              Generate a password reset link for{" "}
              <strong>{selectedUser?.email}</strong>. The link will be copied to
              your clipboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReset}>
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <KeyRound className="h-4 w-4 mr-2" />
              )}
              Generate Reset Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

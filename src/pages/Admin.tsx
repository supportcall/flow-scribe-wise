import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Check, X, Loader2, ArrowLeft, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PendingUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  approval_status: string;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else if (!isAdmin) {
        navigate("/dashboard");
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
      }
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
    } else if (data) {
      setPendingUsers(data.filter((u) => u.approval_status === "pending"));
      setAllUsers(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleApprove = async (profile: PendingUser) => {
    setProcessingId(profile.id);

    // Update approval status
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ approval_status: "approved" })
      .eq("id", profile.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to approve user.",
        variant: "destructive",
      });
      setProcessingId(null);
      return;
    }

    // Assign 'user' role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: profile.user_id, role: "user" });

    if (roleError && !roleError.message.includes("duplicate")) {
      console.error("Role assignment error:", roleError);
    }

    toast({
      title: "User Approved",
      description: `${profile.email} has been approved.`,
    });

    fetchUsers();
    setProcessingId(null);
  };

  const handleReject = async (profile: PendingUser) => {
    setProcessingId(profile.id);

    const { error } = await supabase
      .from("profiles")
      .update({ approval_status: "rejected" })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject user.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "User Rejected",
        description: `${profile.email} has been rejected.`,
      });
      fetchUsers();
    }
    setProcessingId(null);
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8 lg:py-12">
        <div className="container max-w-5xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                </div>
                <p className="text-muted-foreground">Manage user approvals</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="card-feature p-4">
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold text-warning">{pendingUsers.length}</p>
            </div>
            <div className="card-feature p-4">
              <p className="text-sm text-muted-foreground">Approved Users</p>
              <p className="text-2xl font-bold text-success">
                {allUsers.filter((u) => u.approval_status === "approved").length}
              </p>
            </div>
            <div className="card-feature p-4">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{allUsers.length}</p>
            </div>
          </div>

          {/* Pending Users */}
          <div className="card-feature p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Pending Approvals</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No pending approval requests.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-background"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {profile.full_name || "No name"}
                      </p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Registered: {new Date(profile.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={() => handleReject(profile)}
                        disabled={processingId === profile.id}
                      >
                        {processingId === profile.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => handleApprove(profile)}
                        disabled={processingId === profile.id}
                      >
                        {processingId === profile.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Users */}
          <div className="card-feature p-6 mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">All Users</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Email</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((profile) => (
                      <tr key={profile.id} className="border-b border-border/50">
                        <td className="py-3 px-2 text-foreground">
                          {profile.full_name || "—"}
                        </td>
                        <td className="py-3 px-2 text-foreground">{profile.email}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              profile.approval_status === "approved"
                                ? "bg-success/10 text-success"
                                : profile.approval_status === "pending"
                                ? "bg-warning/10 text-warning"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {profile.approval_status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

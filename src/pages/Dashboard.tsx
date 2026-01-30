import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Shield, LogOut, Settings, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { CreditBalance } from "@/components/credits/CreditBalance";
import { TransactionHistory } from "@/components/credits/TransactionHistory";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isApproved, isPending, signOut, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/login");
      } else if (isPending) {
        navigate("/pending-approval");
      }
    }
  }, [user, isApproved, isPending, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isApproved) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8 lg:py-12">
        <div className="container max-w-5xl">
          {/* Welcome Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome, {profile?.full_name || "User"}!
              </h1>
              <p className="text-muted-foreground">
                Your account is approved. Start generating workflows below.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Credit Balance Card */}
          <div className="card-feature p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Credit Balance</p>
                  <CreditBalance showLabel size="md" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">1 credit = $0.01</p>
                <p className="text-xs text-muted-foreground">1 credit per workflow generation</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card-feature p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Generate Workflow
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create production-hardened n8n workflows with our guided wizard.
                  </p>
                  <Link to="/wizard">
                    <Button size="sm" className="gap-2">
                      <Zap className="h-4 w-4" />
                      Start Wizard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="card-feature p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <Settings className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Account Settings
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your profile and preferences.
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="card-feature p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-4">Account Information</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="text-foreground">{profile?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="text-success">Approved</p>
              </div>
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="text-foreground capitalize">{isAdmin ? "Admin" : "User"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Member Since</p>
                <p className="text-foreground">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="card-feature p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Transactions</h3>
            <TransactionHistory />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";

export default function PendingApproval() {
  const navigate = useNavigate();
  const { user, profile, isApproved, signOut, refreshProfile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (isApproved) {
      navigate("/dashboard");
    }
  }, [isApproved, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleRefresh = async () => {
    await refreshProfile();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4 text-center">
          <div className="card-feature p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="h-8 w-8 text-warning" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Pending Approval
            </h1>
            <p className="text-muted-foreground mb-6">
              Your account is awaiting administrator approval. You'll receive access
              once an admin reviews and approves your registration.
            </p>

            {profile?.approval_status === "rejected" && (
              <div className="mb-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive">
                  Your account request has been rejected. Please contact support for
                  more information.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
                Check Status
              </Button>

              <Button
                variant="ghost"
                className="w-full gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireApproval?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireApproval = true,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, isApproved, isPending, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/login");
      } else if (requireApproval && isPending) {
        navigate("/pending-approval");
      } else if (requireApproval && !isApproved) {
        navigate("/pending-approval");
      } else if (requireAdmin && !isAdmin) {
        navigate("/dashboard");
      }
    }
  }, [user, isApproved, isPending, isAdmin, isLoading, navigate, requireApproval, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;
  if (requireApproval && !isApproved) return null;
  if (requireAdmin && !isAdmin) return null;

  return <>{children}</>;
}

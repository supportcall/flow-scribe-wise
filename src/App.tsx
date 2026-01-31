import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CreditsProvider } from "@/hooks/useCredits";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Wizard from "./pages/Wizard";
import Generate from "./pages/Generate";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingApproval from "./pages/PendingApproval";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CreditsProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/wizard"
                element={
                  <ProtectedRoute requireApproval>
                    <Wizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/generate"
                element={
                  <ProtectedRoute requireApproval>
                    <Generate />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireApproval>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireApproval requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CreditsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

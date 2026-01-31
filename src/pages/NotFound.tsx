import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container max-w-2xl text-center">
          {/* 404 Icon/Number */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold text-gradient-primary">404</h1>
          </div>
          
          {/* Error Message */}
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sorry, the page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>
          
          {/* Attempted Path Display */}
          <div className="bg-muted/30 rounded-lg p-4 mb-8 inline-block">
            <p className="text-sm text-muted-foreground">
              Attempted path: <code className="text-primary">{location.pathname}</code>
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Go to Homepage
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
          
          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/wizard" className="text-primary hover:underline text-sm">
                Workflow Wizard
              </Link>
              <Link to="/login" className="text-primary hover:underline text-sm">
                Login
              </Link>
              <Link to="/signup" className="text-primary hover:underline text-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;

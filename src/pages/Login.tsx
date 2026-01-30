import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    const { error } = await signIn(values.email, values.password);

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Welcome back!",
      description: "You have successfully logged in.",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <div className="card-feature p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground mt-2">
                Sign in to your account
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  Sign In
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
